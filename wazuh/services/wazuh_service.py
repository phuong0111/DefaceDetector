import logging
from datetime import datetime, timedelta
from flask import current_app, has_app_context
import requests


class WazuhService:
    """Service for interacting with Wazuh"""
    
    def __init__(self):
        self.connected = False
        self.token = None
        self.token_expiry = None
        self.base_url = ""
        self.verify_certs = False
        self.logger = logging.getLogger(__name__)
    
    def _log_error(self, message):
        """Log error message using appropriate logger"""
        if has_app_context():
            current_app.logger.error(message)
        else:
            self.logger.error(message)
    
    def connect(self, host, username=None, password=None, verify_certs=False):
        """
        Connect to Wazuh endpoint
        
        Args:
            hosts: String or list of host specifications
            username: Username for basic auth
            password: Password for basic auth
            **kwargs: Additional parameters to pass to Wazuh endpoint
            
        Returns:
            dict: Connection status
        """
        try:
            self.base_url = host
            self.verify_certs = verify_certs
            if username and password:
                auth_result = self.get_wazuh_token(username, password)
                if auth_result.get("connected"):
                    return auth_result
                return {"connected": False, "error": auth_result.get("error")}
            
            return {"connected": False, "error": "No credentials provided"}
        
        except Exception as e:
            self._log_error(f"Error connecting to Wazuh: {str(e)}")
            return {"connected": False, "error": str(e)}
        
    def is_connected(self):
        """Check if service has valid authentication token"""
        if datetime.now() > self.token_expiry:
            self.renew_token()
        return self.token is not None and self.token_expiry and datetime.now() < self.token_expiry
    
    def renew_token(self):
        """
        Attempt to renew the authentication token
        
        Returns:
            dict: Authentication result
        """
        # Get credentials from current app context if available
        username = None
        password = None
        
        if has_app_context():
            username = current_app.config.get("WZ_USER")
            password = current_app.config.get("WZ_PASSWORD")
        
        # If credentials are available, get a new token
        if username and password:
            return self.get_wazuh_token(username, password)
        else:
            return {"connected": False, "error": "Missing Wazuh credentials"}
    
    def _request(self, method, endpoint, params=None, data=None):
        """
        Send a request to the Wazuh API
        
        Args:
            method: HTTP method (GET, POST, PUT, DELETE)
            endpoint: API endpoint (without base URL)
            params: URL parameters
            data: Request body data
            
        Returns:
            dict: Response data or error
        """
        if not self.is_connected():
            token_result = self.get_wazuh_token()
            if not token_result.get("connected"):
                return {"error": "Not connected to Wazuh API"}
        
        try:
            # Build request URL
            url = f"{self.base_url}/{endpoint.lstrip('/')}"
            
            # Set headers with authentication token
            headers = {
                "Authorization": f"Bearer {self.token}",
                "Content-Type": "application/json"
            }
            
            # Send request
            response = requests.request(
                method,
                url,
                headers=headers,
                params=params,
                json=data,
                verify=self.verify_certs
            )
            
            # Check if successful
            if response.status_code >= 200 and response.status_code < 300:
                return response.json()
            else:
                error_msg = f"Wazuh API request failed: {response.status_code} - {response.text}"
                self._log_error(error_msg)
                return {"error": error_msg}
                
        except Exception as e:
            self._log_error(f"Error in Wazuh API request: {str(e)}")
            return {"error": str(e)}
        
    def get_wazuh_token(self, username=None, password=None):
        """
        Authenticate with Wazuh API and get a token
        
        Args:
            username: Username for authentication (optional if already set)
            password: Password for authentication (optional if already set)
            
        Returns:
            dict: Authentication result
        """
        try:
            if not username or not password:
                return {"connected": False, "error": "Missing Wazuh credentials"}
            # Check if token is still valid
            if self.token and self.token_expiry and datetime.now() < self.token_expiry:
                return {"connected": True, "token": self.token}
            
            # Build authentication URL
            auth_url = f"{self.base_url}/security/user/authenticate"
            
            # Authenticate with Wazuh API
            response = requests.post(
                auth_url,
                auth=(username, password),
                verify=self.verify_certs
            )
            
            # Process response
            if response.status_code == 200:
                data = response.json()
                self.token = data.get("data", {}).get("token")
                
                # Set token expiry (default to 15 minutes if not specified)
                # Note: Wazuh tokens typically expire after 15 minutes
                self.token_expiry = datetime.now() + timedelta(minutes=15)
                
                return {
                    "connected": True,
                    "token": self.token,
                    "expires": self.token_expiry
                }
            else:
                error_msg = f"Authentication failed: {response.status_code} - {response.text}"
                self._log_error(error_msg)
                return {"connected": False, "error": error_msg}
            
        except Exception as e:
            self._log_error(f"Error getting Wazuh token: {str(e)}")
            return {"connected": False, "error": str(e)}
    
    def get_wazuh_agents(self, status=None, offset=0, limit=500, sort=None) -> dict:
        """
        Get list of Wazuh agents
        
        Args:
            status: Filter by agent status (active, disconnected, never_connected, pending)
            offset: First item to return
            limit: Maximum number of items to return
            sort: Sort field and order (e.g., "name asc")
            
        Returns:
            dict: List of agents or error
        """
        # Build parameters
        params = {
            "offset": offset,
            "limit": limit
        }
        
        if status:
            params["status"] = status
            
        if sort:
            params["sort"] = sort
            
        # Get agents
        return self._request("GET", "/agents", params=params)
    
    def get_agent_info(self, agent_id) -> dict:
        """
        Get information about a specific agent
        
        Args:
            agent_id: Agent ID
            
        Returns:
            dict: Agent information or error
        """
        return self._request("GET", f"/agents/{agent_id}/stats/agent")