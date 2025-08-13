import time
import os
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore
from gradio_client import Client

client = Client("https://094d43019c0743b66c.gradio.live/")



def parse_gradio_result(response_text):
    attributes = {}

    # Handle both \n and ; separated data
    if ";" in response_text:
        lines = response_text.strip().split(";")
    else:
        lines = response_text.strip().split("\n")

    for line in lines:
        if ":" in line:
            key, value = line.split(":", 1)
            attributes[key.strip().lower().replace(" ", "_")] = value.strip()

    return attributes


def get_gradio_attributes(log_line):
    try:
        result = client.predict(input_text=log_line, api_name="/predict")
        return parse_gradio_result(result)
    except Exception as e:
        print(f"Gradio API error: {e}")
        return {}
    
# === Firebase Setup ===
cred = credentials.Certificate("firebase_key.json")
firebase_admin.initialize_app(cred)
db = firestore.client()
print("started")

LOG_FILE = "C:\\Users\\pathToYourLogFile\\server_incidents.log"
def parse_and_store(buffer):
    data = {}
    log_line = None  # Capture the log value for Gradio

    for line in buffer:
        line = line.strip()
        if line.startswith("ID:"):
            data["incident_id"] = line.replace("ID:", "").strip()
        elif line.startswith("Title:"):
            data["title"] = line.replace("Title:", "").strip()
        elif line.startswith("Status:"):
            data["status"] = line.replace("Status:", "").strip()
        elif line.startswith("Location:"):
            data["location"] = line.replace("Location:", "").strip()
        elif line.startswith("ReportedBy:"):
            data["reported_by"] = line.replace("ReportedBy:", "").strip()
        elif line.startswith("ResolutionTime:"):
            data["resolution_time"] = line.replace("ResolutionTime:", "").strip()
        elif line.startswith("SLA:"):
            data["sla_breached"] = line.replace("SLA:", "").strip()
        elif line.startswith("Log:"):
            data["log"] = line.replace("Log:", "").strip()
            log_line = data["log"]  # Save for Gradio
        elif line.startswith("System:"):
            data["system"] = line.replace("System:", "").strip()
        elif line.startswith("Module:"):
            data["module"] = line.replace("Module:", "").strip()

    if "incident_id" in data:
        data["timestamp"] = datetime.now().isoformat()

        # 👉 Gradio API enrichment
        if log_line:
            try:
                gradio_data = get_gradio_attributes(log_line)
                data.update(gradio_data)
            except Exception as e:
                print(f"Failed to get Gradio attributes: {e}")

        db.collection("incidents").document(data["incident_id"]).set(data)
        print(f"Stored: {data['incident_id']}")
    else:
        print("Skipped block: no incident_id found")

def follow_log():
    print(f"Monitoring log: {LOG_FILE}")
    with open(LOG_FILE, "r") as f:
        f.seek(0, os.SEEK_END)

        buffer = []
        while True:
            line = f.readline()
            if not line:
                time.sleep(0.5)
                continue

            if line.strip() == "---------------------------":
                if buffer:
                    parse_and_store(buffer)
                    buffer = []
            else:
                buffer.append(line)

if __name__ == "__main__":
    follow_log()

