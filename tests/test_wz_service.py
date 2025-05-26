import sys
sys.path.append("..")

from backend.config import Config
from backend.services import WazuhService

wz_service = WazuhService()
result = wz_service.connect(host=Config.WZ_URL, username=Config.WZ_USERNAME, password=Config.WZ_PASSWORD, verify_certs=Config.WZ_VERIFY_CERTS)
print(result)

agents = wz_service.get_wazuh_agents()
print(agents)

