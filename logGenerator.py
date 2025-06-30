from flask import Flask, jsonify
import random
import time
import uuid
from datetime import datetime
import threading

app = Flask(__name__)

LOG_FILE = "server_incidents.log"

# Enhanced sample pools
titles = [
    "Unauthorized access attempt",
    "High latency in transaction system",
    "Database read timeout",
    "Memory leak in analytics module",
    "Service unavailable on endpoint /auth",
    "Repeated 504 Gateway Timeout errors"
]

locations = ["Chennai", "Bangalore", "Mumbai", "Hyderabad", "Delhi", "Pune", "Kolkata"]
systems = ["WebServer1", "DatabaseNode2", "AuthGateway", "APIServer", "LoadBalancer"]
modules = ["Tomcat", "SpringBoot", "Flask", "Nginx", "Redis"]

# Realistic log patterns
logs = [
    "[ERROR] TLS handshake failed with upstream server",
    "[WARNING] Disk space below 10% on /var",
    "[ALERT] Rate limiting triggered for IP 192.168.1.150",
    "[CRITICAL] Memory usage exceeded threshold in AuthGateway",
    "[ERROR] 504 Gateway Timeout on /checkout",
    "[WARNING] Multiple failed login attempts from unknown device",
    "[ERROR] Dependency service not responding on port 8080",
    "[ERROR] DB query took 15s (threshold: 2s)",
    "[WARNING] Token signature verification failed",
    "[CRITICAL] CPU at 97% for 10m+ on WebServer1",
]

# Constants
REPORTED_BY = "MonitoringSystem"
RESOLUTION_TIME = "Pending"
DEFAULT_STATUS = "Open"
DEFAULT_SLA = "Yes"

def generate_incident():
    incident_id = f"INC{str(uuid.uuid4())[:8].upper()}"
    incident = {
        "incident_id": incident_id,
        "title": random.choice(titles),
        "status": DEFAULT_STATUS,
        "location": random.choice(locations),
        "reported_by": REPORTED_BY,
        "resolution_time": RESOLUTION_TIME,
        "sla_breached": DEFAULT_SLA,
        "log": random.choice(logs),
        "system": random.choice(systems),
        "module": random.choice(modules),
    }

    # Write to log file
    log_entry = (
        f"ID: {incident['incident_id']}\n"
        f"Title: {incident['title']}\n"
        f"Status: {incident['status']}\n"
        f"Location: {incident['location']}\n"
        f"ReportedBy: {incident['reported_by']}\n"
        f"ResolutionTime: {incident['resolution_time']}\n"
        f"SLA: {incident['sla_breached']}\n"
        f"Log: {incident['log']}\n"
        f"System: {incident['system']}\n"
        f"Module: {incident['module']}\n"
        "---------------------------\n"
    )

    with open(LOG_FILE, "a") as f:
        f.write(log_entry)

    return incident

@app.route("/generate-log", methods=["GET"])
def generate_log():
    incident = generate_incident()
    return jsonify(incident), 200

# Increase frequency and volume if needed
def simulate_background_logging(interval=2):
    while True:
        for _ in range(5):  # generate 5 logs every interval
            generate_incident()
        time.sleep(interval)

if __name__ == "__main__":
    threading.Thread(target=simulate_background_logging, daemon=True).start()
    app.run(debug=True)
