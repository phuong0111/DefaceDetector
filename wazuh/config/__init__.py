import os
from dotenv import load_dotenv
from datetime import timedelta, timezone

import urllib3

# Load environment variables from .env file
load_dotenv()


class Config:
    """Base configuration"""
    DEBUG = os.environ.get("DEBUG_MODE", "false").lower() == "true"
    TESTING = False
    
    # API Configuration
    API_HOST = os.environ.get("API_HOST", "0.0.0.0")
    API_PORT = int(os.environ.get("API_PORT", 5001))
    
    # Elasticsearch Configuration
    ES_HOST = os.environ.get("ES_HOST", "localhost")
    ES_PORT = int(os.environ.get("ES_PORT", 9200))
    ES_USERNAME = os.environ.get("ES_USERNAME")
    ES_PASSWORD = os.environ.get("ES_PASSWORD")
    ES_USE_SSL = os.environ.get("ES_USE_SSL", "false").lower() == "true"
    ES_VERIFY_CERTS = os.environ.get("ES_VERIFY_CERTS", "false").lower() == "true"
    
    # Construct Elasticsearch URL
    ES_URL = f"{'https' if ES_USE_SSL else 'http'}://{ES_HOST}:{ES_PORT}"
    
    # Timezone Configuration
    TIMEZONE_OFFSET = int(os.environ.get("TIMEZONE_OFFSET", 0))
    TZ = timezone(timedelta(hours=TIMEZONE_OFFSET))
    
    # Monitoring Configuration
    DEFAULT_INDEX = os.environ.get("DEFAULT_INDEX", "wazuh-alerts-*")
    DEFAULT_WINDOW_SIZE = int(os.environ.get("DEFAULT_WINDOW_SIZE", 5))
    STATS_INTERVAL = int(os.environ.get("STATS_INTERVAL", 60))
    
    # Logging Configuration
    LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")
    LOG_FILE = os.environ.get("LOG_FILE", "security_monitor.log")
    
    # Wazuh Configuration
    WZ_USERNAME = os.environ.get("WZ_USERNAME")
    WZ_PASSWORD = os.environ.get("WZ_PASSWORD")
    WZ_PORT = int(os.environ.get("WZ_PORT", 55000))
    WZ_USE_SSL = os.environ.get("WZ_USE_SSL", "false").lower() == "true"
    WZ_VERIFY_CERTS = os.environ.get("WZ_VERIFY_CERTS", "false").lower() == "true"
    
    # Construct Wazuh URL
    WZ_URL = f"{'https' if WZ_USE_SSL else 'http'}://{ES_HOST}:{WZ_PORT}"
    
    # Disable urllib3 ssl warning
    if os.environ.get('DISABLE_SSL_WARNINGS', 'True').lower() == 'true':
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
        
    ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS").split(",")
    

class DevelopmentConfig(Config):
    """Development configuration"""
    ENV = "development"
    

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    ENV = "testing"
    

class ProductionConfig(Config):
    """Production configuration"""
    ENV = "production"
    DEBUG = False