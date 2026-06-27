import time, json, os
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import database
import models

LOG_FILE = "../mock_data/eve.json"

class SuricataHandler(FileSystemEventHandler):
   def __init__(self):
      self.file_position = 0
      # Create the file if it doesn't exist yet
      if not os.path.exists(LOG_FILE):
         open(LOG_FILE, 'w').close()

   def on_modified(self, event):
      # Trigger only when the specific eve.json file is modified
      if event.src_path.endswith("eve.json"):
         self.process_new_logs()

   def process_new_logs(self):
      db = database.SessionLocal()
      try:
         with open(LOG_FILE, 'r') as f:
               # Jump to the last read position
               f.seek(self.file_position)
               
               for line in f:
                  if not line.strip():
                     continue
                  try:
                     log_entry = json.loads(line)
                     
                     # Suricata logs all traffic, but we only care about "alerts"
                     if log_entry.get("event_type") == "alert":
                           alert_data = log_entry["alert"]
                           
                           # Log the threat. For this MVP test, we link it to device_id=1 
                           # (the guest_user@gmail.com we created earlier)
                           new_alert = models.ThreatAlert(
                              device_id=1, 
                              signature=alert_data.get("signature", "Unknown Threat Signature"),
                              severity=alert_data.get("severity", 3),
                              action_taken="logged"
                           )
                           db.add(new_alert)
                           db.commit()
                           print(f"🚨 THREAT LOGGED: {alert_data.get('signature')}")
                           
                  except json.JSONDecodeError:
                     continue
               
               # Update the cursor position for the next read
               self.file_position = f.tell()
      finally:
         db.close()

def start_watcher():
   print(f"👁️ ZeroGate NOC Watcher started. Monitoring {LOG_FILE}...")
   handler = SuricataHandler()
   
   # Do an initial read just in case there is data there already
   handler.process_new_logs()

   observer = Observer()
   # Watch the directory containing the file
   observer.schedule(handler, path="../mock_data", recursive=False)
   observer.start()
   
   try:
      while True:
         time.sleep(1)
   except KeyboardInterrupt:
      observer.stop()
      print("\nWatcher stopped.")
   observer.join()

if __name__ == "__main__":
   start_watcher()