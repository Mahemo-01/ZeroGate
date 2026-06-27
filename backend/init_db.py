from database import engine, Base, SessionLocal
import models
import datetime

print("Creating database tables...")
models.Base.metadata.create_all(bind=engine)

print("Injecting mock data for React Dashboard testing...")
db = SessionLocal()

if not db.query(models.ConnectedDevice).first():
   # Simulate a user logging into the Captive Portal
   mock_device = models.ConnectedDevice(
      mac_address = "A1:B2:C3:D4:E5:F6",
      ip_address = "192.168.1.105",
      email = "guest_user@gmail.com",
      custom_label = "MacBook Pro",
      is_authenticated = True
   )
   db.add(mock_device)
   db.commit()
   db.refresh(mock_device)

   # Simulate Suricata catching this device doing something bad
   mock_alert = models.ThreatAlert(
      device_id = mock_device.id,
      signature = "ET SCAN Potential SSH Brute-Force",
      severity = 1,
      action_taken = "logged"
   )
   db.add(mock_alert)
   db.commit()

   print("Mock data successfully injected!")
else:
   print("Database already contains data. Skipping injection.")

db.close()