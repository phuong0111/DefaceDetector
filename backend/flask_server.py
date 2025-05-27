#!/usr/bin/env python3

from flask import Flask, request, jsonify
import json
import logging
from datetime import datetime
import os

app = Flask(__name__)

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
        
        # Extract key information from the alert
        processed_alert = process_wazuh_alert(alert_data)
        
        # Store the alert
        alerts_storage.append(processed_alert)
        
        # Log the alert
        logging.info(f"Wazuh Alert Received: {processed_alert['rule_description']}")
        
        return jsonify({"status": "success", "message": "Alert processed"}), 200
        
    except Exception as e:
        logging.error(f"Error processing Wazuh alert: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

def process_wazuh_alert(alert_data):
    """
    Process and extract relevant information from Wazuh alert
    """
    processed = {
        "timestamp": datetime.now().isoformat(),
        "alert_id": alert_data.get("id", "N/A"),
        "rule_id": alert_data.get("rule", {}).get("id", "N/A"),
        "rule_level": alert_data.get("rule", {}).get("level", "N/A"),
        "rule_description": alert_data.get("rule", {}).get("description", "N/A"),
        "agent_name": alert_data.get("agent", {}).get("name", "N/A"),
        "agent_ip": alert_data.get("agent", {}).get("ip", "N/A"),
        "location": alert_data.get("location", "N/A"),
        "full_log": alert_data.get("full_log", "N/A"),
        "raw_alert": alert_data
    }
    
    return processed

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
        "total_alerts_received": len(alerts_storage)
    })

if __name__ == '__main__':
    # Create log directory if it doesn't exist
    os.makedirs('./log', exist_ok=True)
    
    # Run the Flask app
    app.run(
        host='0.0.0.0',  # Listen on all interfaces
        port=5001,       # Change port as needed
        debug=False      # Set to False in production
    )