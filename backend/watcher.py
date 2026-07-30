import time, json, os, requests
from collections import defaultdict, deque
from datetime import datetime, timedelta
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import database
import models
from firewall import network_guard

LOG_FILE = "/var/log/suricata/eve.json"

# --- BAN POLICY ---
REPEAT_OFFENSE_WINDOW = timedelta(minutes = 5)
REPEAT_OFFENSE_THRESHOLD = 3

class SuricataHandler(FileSystemEventHandler):
   def __init__(self):
      self.file_position = 0
      log_dir = os.path.dirname(os.path.abspath(LOG_FILE))
      if not os.path.exists(log_dir): os.makedirs(log_dir, exist_ok = True)
      if not os.path.exists(LOG_FILE): open(LOG_FILE, 'w').close()
      self.recent_offenses = defaultdict(deque)

   def on_modified(self, event):
      if event.src_path.endswith("eve.json"): self.process_new_logs()

   def _register_offense_and_check_threshold(self, mac_address: str) -> bool:
      """Tracks severity-2 hits per device in a rolling window.
      Returns True once the device crosses the ban threshold."""
      now = datetime.now()
      offenses = self.recent_offenses[mac_address]
      offenses.append(now)

      while offenses and (now - offenses[0]) > REPEAT_OFFENSE_WINDOW: offenses.popleft()
      return len(offenses) >= REPEAT_OFFENSE_THRESHOLD

   def process_new_logs(self):
      db = database.SessionLocal()
      try:
         current_size = os.path.getsize(LOG_FILE)
         if current_size < self.file_position:
            print("- [WATCHER]: Detected log rotation, resetting read cursor.")
            self.file_position = 0

         with open(LOG_FILE, 'r') as f:
            f.seek(self.file_position) # Last read position
            
            for line in f:
               if not line.strip(): continue
               try:
                  log_entry = json.loads(line)
                  
                  if log_entry.get("event_type") == "alert":
                        alert_data = log_entry.get("alert", {})
                        src_ip = log_entry.get("src_ip")
                        signature = alert_data.get("signature", "Unknown Threat Signature")
                        severity = alert_data.get("severity", 3)
                        suspicious_device = db.query(models.ConnectedDevice).filter(models.ConnectedDevice.ip_address == src_ip).first()
                        
                        if suspicious_device:
                           should_ban = False
                           if severity == 1: should_ban = True
                           elif severity == 2: should_ban = self._register_offense_and_check_threshold(suspicious_device.mac_address)
                           if should_ban:
                              action = "Blocked (Auto)"
                              network_guard.block_device(suspicious_device.mac_address)
                              suspicious_device.is_blocked = True
                              suspicious_device.is_authenticated = False
                              suspicious_device.risk_level = "High"
                              print(f"🛑 [A-BAN]: Threat Level {severity}. Disconnected MAC: {suspicious_device.mac_address}")
                           else:
                              action = "Logged"
                              if severity == 2 and suspicious_device.risk_level in (None, "None", "Low"): suspicious_device.risk_level = "Medium"
                              elif suspicious_device.risk_level == "None": suspicious_device.risk_level = "Low"

                           new_alert = models.ThreatAlert(
                              device_id = suspicious_device.id, 
                              signature = signature,
                              severity = severity,
                              action_taken = action
                           )
                           db.add(new_alert)
                           db.commit()
                           print(f"🚨 [THREAT]: {signature} | User: {suspicious_device.email}")
                        else:
                           print(f"⚠️ [ALERT]: IP {src_ip} not identify in DB. Signature: {signature}")

                        try: requests.post("http://127.0.0.1:8000/api/internal/trigger-update", timeout = 2)
                        except requests.exceptions.RequestException as e: print(f"⚠️ No se pudo notificar a la API principal: {e}") 
                        
               except json.JSONDecodeError: continue
            
            self.file_position = f.tell() # Update cursor position
      except Exception as e: print(f"❌ Error reading Suricata logs: {e}")
      finally: db.close()

def start_watcher():
   print(f"ZeroGate NOC Watcher started. Monitoring {LOG_FILE}...")
   handler = SuricataHandler()
   handler.process_new_logs() # Initial read just in case
   observer = Observer()
   watch_dir = os.path.dirname(os.path.abspath(LOG_FILE))
   observer.schedule(handler, path = watch_dir, recursive = False)
   observer.start()
   
   try:
      while True: time.sleep(1)
   except KeyboardInterrupt:
      observer.stop()
      print("\nWatcher stopped.")
   observer.join()

if __name__ == "__main__":
   start_watcher()