#!/usr/bin/env python3

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import json
import logging
from datetime import datetime
import os

app = Flask(__name__)
CORS(app, cors_allowed_origins="*")

# Configure SocketIO for WebSocket support
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('./log/wazuh_flask_alerts.log'),
        logging.StreamHandler()
    ]
)

# Store alerts in memory (you might want to use a database in production)
alerts_storage = []
# Track processed alerts to prevent duplicates
processed_alerts = set()

def generate_alert_fingerprint(alert_data):
    """Generate unique fingerprint for alert deduplication"""
    timestamp = alert_data.get("timestamp", datetime.now().isoformat())
    rule_id = alert_data.get("rule", {}).get("id", "N/A")
    agent_name = alert_data.get("agent", {}).get("name", "N/A")
    description = alert_data.get("rule", {}).get("description", "N/A")
    
    return f"{timestamp}-{rule_id}-{agent_name}-{description}"

@app.route('/webhook/wazuh', methods=['POST'])
def receive_wazuh_alert():
    """
    Webhook endpoint to receive Wazuh alerts
    """
    try:
        # Get the JSON data from the request
        alert_data = request.get_json()
        
        if not alert_data:
            return jsonify({"error": "No JSON data received"}), 400
        
        # Check for duplicates
        alert_fingerprint = generate_alert_fingerprint(alert_data)
        if alert_fingerprint in processed_alerts:
            logging.info(f"Duplicate alert ignored: {alert_fingerprint}")
            return jsonify({"status": "ignored", "message": "Duplicate alert"}), 200
        
        # Add to processed set
        processed_alerts.add(alert_fingerprint)
        
        # Clean up old fingerprints (keep last 1000)
        if len(processed_alerts) > 1000:
            # Keep only recent 500 fingerprints
            recent_fingerprints = list(processed_alerts)[-500:]
            processed_alerts.clear()
            processed_alerts.update(recent_fingerprints)
        
        # Extract key information from the alert
        processed_alert = process_wazuh_alert(alert_data)
        
        # Store the alert
        alerts_storage.append(processed_alert)
        
        # Keep only last 100 alerts in memory
        if len(alerts_storage) > 100:
            alerts_storage[:] = alerts_storage[-100:]
        
        # Log the alert
        logging.info(f"Wazuh Alert Received: {processed_alert['rule_description']}")
        
        # Emit alert to connected frontend clients via WebSocket
        socketio.emit('new_alert', processed_alert)
        logging.info("Alert broadcasted to connected frontends")
        
        # Handle specific alert types
        handle_specific_alerts(processed_alert)
        
        return jsonify({"status": "success", "message": "Alert processed and broadcasted"}), 200
        
    except Exception as e:
        logging.error(f"Error processing Wazuh alert: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

def process_wazuh_alert(alert_data):
    """
    Process and extract relevant information from Wazuh alert
    """
    # Generate consistent ID if not present
    alert_id = alert_data.get("id")
    if not alert_id:
        fingerprint = generate_alert_fingerprint(alert_data)
        import base64
        alert_id = base64.b64encode(fingerprint.encode()).decode()[:12]
    
    processed = {
        "id": alert_id,
        "timestamp": alert_data.get("timestamp", datetime.now().isoformat()),
        "alert_id": alert_data.get("id", alert_id),
        "rule_id": alert_data.get("rule", {}).get("id", "N/A"),
        "rule_level": alert_data.get("rule", {}).get("level", "N/A"),
        "rule_description": alert_data.get("rule", {}).get("description", "N/A"),
        "agent_name": alert_data.get("agent", {}).get("name", "N/A"),
        "agent_ip": alert_data.get("agent", {}).get("ip", "N/A"),
        "location": alert_data.get("location", "N/A"),
        "full_log": alert_data.get("full_log", "N/A"),
        "rule": alert_data.get("rule", {}),
        "agent": alert_data.get("agent", {}),
        "data": alert_data,
        "raw_alert": alert_data
    }
    
    return processed

def handle_specific_alerts(alert):
    """
    Handle specific types of alerts with custom logic
    """
    rule_level = alert["rule_level"]
    rule_id = alert["rule_id"]
    
    # Example: High severity alerts (level 12+)
    if isinstance(rule_level, int) and rule_level >= 12:
        logging.warning(f"HIGH SEVERITY ALERT: {alert['rule_description']}")
        # Add your custom high severity alert handling here
        # e.g., send email, SMS, or trigger other systems
    
    # Example: SSH brute force attacks
    if rule_id in ["5710", "5712"]:
        logging.warning(f"SSH BRUTE FORCE DETECTED from {alert['agent_ip']}")
        # Add specific SSH brute force handling
    
    # Example: File integrity monitoring alerts
    if "syscheck" in alert.get("location", ""):
        logging.info(f"FILE CHANGE DETECTED: {alert['rule_description']}")
        # Add file change handling
    
    # Example: Authentication failures
    if "authentication_failed" in alert.get("rule_description", "").lower():
        logging.warning(f"AUTH FAILURE: {alert['rule_description']} on {alert['agent_name']}")
        # Add authentication failure handling

@app.route('/alerts', methods=['GET'])
def get_alerts():
    """
    API endpoint to retrieve stored alerts
    """
    # Get query parameters for filtering
    limit = request.args.get('limit', 50, type=int)
    level_filter = request.args.get('level', type=int)
    agent_filter = request.args.get('agent')
    
    filtered_alerts = alerts_storage
    
    # Apply filters
    if level_filter:
        filtered_alerts = [a for a in filtered_alerts if a['rule_level'] >= level_filter]
    
    if agent_filter:
        filtered_alerts = [a for a in filtered_alerts if agent_filter.lower() in a['agent_name'].lower()]
    
    # Limit results
    filtered_alerts = filtered_alerts[-limit:]
    
    return jsonify({
        "total_alerts": len(filtered_alerts),
        "alerts": filtered_alerts
    })

@app.route('/alerts/stats', methods=['GET'])
def get_alert_stats():
    """
    Get basic statistics about alerts
    """
    if not alerts_storage:
        return jsonify({"message": "No alerts available"})
    
    # Calculate stats
    total_alerts = len(alerts_storage)
    
    # Count by rule level
    level_counts = {}
    agent_counts = {}
    
    for alert in alerts_storage:
        level = alert['rule_level']
        agent = alert['agent_name']
        
        level_counts[level] = level_counts.get(level, 0) + 1
        agent_counts[agent] = agent_counts.get(agent, 0) + 1
    
    return jsonify({
        "total_alerts": total_alerts,
        "alerts_by_level": level_counts,
        "alerts_by_agent": agent_counts,
        "latest_alert": alerts_storage[-1] if alerts_storage else None
    })

@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    """
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "total_alerts_received": len(alerts_storage),
        "processed_fingerprints": len(processed_alerts)
    })

@app.route('/clear', methods=['POST'])
def clear_alerts():
    """
    Clear all stored alerts and processed fingerprints (for testing)
    """
    global alerts_storage, processed_alerts
    alerts_storage.clear()
    processed_alerts.clear()
    
    logging.info("All alerts and processed fingerprints cleared")
    return jsonify({"status": "success", "message": "All alerts cleared"})

# WebSocket event handlers
@socketio.on('connect')
def handle_connect():
    """Handle frontend connection"""
    logging.info("Frontend connected via WebSocket")
    emit('connection_status', {'status': 'connected'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle frontend disconnection"""
    logging.info("Frontend disconnected from WebSocket")

@socketio.on('get_recent_alerts')
def handle_get_recent_alerts():
    """Send recent alerts to newly connected frontend"""
    recent_alerts = alerts_storage[-10:] if alerts_storage else []
    emit('recent_alerts', recent_alerts)

if __name__ == '__main__':
    # Create log directory if it doesn't exist
    os.makedirs('./log', exist_ok=True)
    
    # Run the Flask app with SocketIO
    socketio.run(
        app,
        host='0.0.0.0',  # Listen on all interfaces
        port=5001,       # Use port 5001 for both HTTP and WebSocket
        debug=False,     # Set to False in production
        allow_unsafe_werkzeug=True  # For development only
    )