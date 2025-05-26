import logging
import os
from logging.handlers import RotatingFileHandler
from pathlib import Path

def setup_logger(app):
    """
    Configure logging for the Flask application.
    
    Args:
        app: Flask application instance
    """
    # Create logs directory if it doesn't exist
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # Get log configuration from app config or environment
    log_level = app.config.get("LOG_LEVEL", os.environ.get("LOG_LEVEL", "INFO"))
    log_file = app.config.get("LOG_FILE", os.environ.get("LOG_FILE", "security_monitor.log"))
    
    # Ensure log file path is properly constructed
    # if not os.path.isabs(log_file):
    log_file = log_dir / log_file
        
    log_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # File handler with rotation
    file_handler = RotatingFileHandler(
        log_file, 
        maxBytes=10485760,  # 10MB
        backupCount=10
    )
    file_handler.setFormatter(log_formatter)
    file_handler.setLevel(log_level)
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(log_formatter)
    console_handler.setLevel(log_level)
    
    # Set up the app logger
    app.logger.handlers = []
    app.logger.addHandler(file_handler)
    app.logger.addHandler(console_handler)
    app.logger.setLevel(log_level)
    
    # Log startup information
    app.logger.info(f"Logger initialized with level: {log_level}")
    app.logger.info(f"Log file: {log_file}")
    
    # Return logger for imports in other files
    return app.logger