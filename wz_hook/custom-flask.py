#!/usr/bin/env python3

import json
import sys
import time
import os
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Debug settings
debug_enabled = True
pwd = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))
log_file = '{0}/logs/integrations.log'.format(pwd)
now = time.strftime("%a %b %d %H:%M:%S %Z %Y")

def main(args):
    """
    Main function to process Wazuh alerts and send to listener server
    Following official Wazuh integration specification
    """
    debug(f"# Number of arguments: {len(args)}")
    debug(f"# Arguments: {args}")
    
    # Read command line arguments according to Wazuh specification
    # args[1] = alert file location
    # args[2] = api_key (can be empty)
    # args[3] = hook_url (can be empty)
    
    if len(args) < 2:
        debug("# Error: Not enough arguments provided")
        sys.exit(1)
    
    alert_file_location = args[1]
    api_key = args[2] if len(args) > 2 and args[2] else ""
    hook_url = args[3] if len(args) > 3 and args[3] else ""
    
    debug(f"# Alert file location: {alert_file_location}")
    debug(f"# API key: {'[PROVIDED]' if api_key else '[EMPTY]'}")
    debug(f"# Hook URL: {hook_url if hook_url else '[EMPTY]'}")
    
    # Load and parse the alert
    try:
        with open(alert_file_location) as alert_file:
            json_alert = json.load(alert_file)
        
        debug("# Alert loaded successfully")
        debug(f"# Alert content: {json.dumps(json_alert, indent=2)}")
        
        # Send alert to listener server
        send_alert_to_listener(json_alert, hook_url, api_key)
        
    except FileNotFoundError:
        debug(f"# Error: Alert file not found: {alert_file_location}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        debug(f"# Error: Invalid JSON in alert file: {str(e)}")
        sys.exit(1)
    except Exception as e:
        debug(f"# Error processing alert: {str(e)}")
        sys.exit(1)

def send_alert_to_listener(alert, hook_url, api_key):
    """
    Send the alert to the listener webhook endpoint
    """
    try:
        # Use hook_url from command line argument or fall back to default
        webhook_url = hook_url if hook_url else "http://127.0.0.1:5000/webhook/wazuh"
        
        debug(f"# Using webhook URL: {webhook_url}")
        
        # Configure requests session with retry strategy
        session = requests.Session()
        retry_strategy = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        session.mount("http://", adapter)
        session.mount("https://", adapter)
        
        # Prepare headers
        headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'Wazuh-listener-Integration/1.0'
        }
        
        # Add API key to headers if provided
        if api_key:
            headers['X-API-Key'] = api_key
        
        # Extract key fields from alert for logging
        try:
            alert_level = alert.get('rule', {}).get('level', 'N/A')
            rule_id = alert.get('rule', {}).get('id', 'N/A')
            description = alert.get('rule', {}).get('description', 'N/A')
            agent_name = alert.get('agent', {}).get('name', 'N/A')
            agent_id = alert.get('agent', {}).get('id', 'N/A')
            
            debug(f"# Alert details - Level: {alert_level}, Rule ID: {rule_id}")
            debug(f"# Agent: {agent_name} (ID: {agent_id})")
            debug(f"# Description: {description}")
        except Exception as e:
            debug(f"# Error extracting alert details: {str(e)}")
        
        # Send the alert
        debug("# Sending alert to listener server")
        response = session.post(
            webhook_url,
            json=alert,
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            debug("# Alert sent successfully")
            debug(f"# Response: {response.text}")
        else:
            debug(f"# Error sending alert. Status code: {response.status_code}")
            debug(f"# Response: {response.text}")
            
    except requests.exceptions.ConnectionError as e:
        debug(f"# Connection error: Cannot reach listener server at {webhook_url}")
        debug(f"# Error details: {str(e)}")
    except requests.exceptions.Timeout as e:
        debug(f"# Timeout error: listener server did not respond within 30 seconds")
        debug(f"# Error details: {str(e)}")
    except requests.exceptions.RequestException as e:
        debug(f"# Network error sending alert: {str(e)}")
    except Exception as e:
        debug(f"# Unexpected error sending alert: {str(e)}")

def debug(msg):
    """
    Debug logging function
    """
    if debug_enabled:
        msg = f"{now}: {msg}\n"
        print(msg)
        
        # Ensure log directory exists
        os.makedirs(os.path.dirname(log_file), exist_ok=True)
        
        try:
            with open(log_file, "a") as f:
                f.write(msg)
        except Exception as e:
            print(f"Error writing to log file: {e}")

if __name__ == "__main__":
    try:
        main(sys.argv)
    except Exception as e:
        debug(f"# Fatal error: {str(e)}")
        sys.exit(1)