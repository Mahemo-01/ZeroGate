import time, json, os, requests
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import database
import models

LOG_FILE = "../mock_data/eve.json"

class SuricataHandler(FileSystemEventHandler):
   def __init__(self):
      self.file_position = 0
      if not os.path.exists(LOG_FILE): open(LOG_FILE, 'w').close()

   def on_modified(self, event):
      if event.src_path.endswith("eve.json"): self.process_new_logs()

   def process_new_logs(self):
      db = database.SessionLocal()
      try:
         with open(LOG_FILE, 'r') as f:
               # Last read position
               f.seek(self.file_position)
               
               for line in f:
                  if not line.strip(): continue
                  try:
                     log_entry = json.loads(line)
                     
                     # Suricata logs all traffic, but we only care about "alerts"
                     if log_entry.get("event_type") == "alert":
                           alert_data = log_entry["alert"]
                           
                           # Log the threat. For this MVP test, we link it to device_id=1 
                           new_alert = models.ThreatAlert(
                              device_id = 1, 
                              signature = alert_data.get("signature", "Unknown Threat Signature"),
                              severity = alert_data.get("severity", 3),
                              action_taken="logged"
                           )
                           db.add(new_alert)
                           db.commit()
                           print(f"🚨 THREAT LOGGED: {alert_data.get('signature')}")

                           try: requests.post("http://127.0.0.1:8000/api/internal/trigger-update", timeout = 2)
                           except requests.exceptions.RequestException as e: print(f"⚠️ No se pudo notificar a la API: {e}")
                           
                  except json.JSONDecodeError: continue
               
               # Update cursor position
               self.file_position = f.tell()
      finally: db.close()

def start_watcher():
   print(f"ZeroGate NOC Watcher started. Monitoring {LOG_FILE}...")
   handler = SuricataHandler()
   handler.process_new_logs() # Initial read just in case
   observer = Observer()
   observer.schedule(handler, path = "../mock_data", recursive = False)
   observer.start()
   
   try:
      while True: time.sleep(1)
   except KeyboardInterrupt:
      observer.stop()
      print("\nWatcher stopped.")
   observer.join()

if __name__ == "__main__":
   start_watcher()