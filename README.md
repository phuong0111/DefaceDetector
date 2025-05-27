# DefaceDetector

```
git clone https://github.com/phuong0111/DefaceDetector.git

# Python env: python 3.9 (this project was built with python 3.9)
cd DefaceDetector
python3 -m venv .venv
source ./.venv/bin/activate
pip install -r wazuh/requirements.txt

# App
cd monitor

# Backend server
cd backend
npm install
node start-server.js

# Frontend server
cd ..
cd frontend
npm install
npm start

# Testing
cd ../../tests
python3 test_random_trigger.py
Enter 1 for simulating webhook by sending 10 log to backend server
Enter 6 to quit
```