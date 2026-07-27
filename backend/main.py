from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List
from pydantic import BaseModel
from firewall import network_guard
import database, models
from database import engine

models.Base.metadata.create_all(bind = engine)

app = FastAPI(title = "ZeroGate Core API", version = "1.0.0")

# Enable CORS (Cross-Origin Resource Sharing)
# This allows your Next.js frontend running on a different port (e.g., localhost:3000)
# to safely make requests to this Python API (localhost:8000).
app.add_middleware(
   CORSMiddleware,
   allow_origins = ["*"],    # In production, specify your exact frontend URL
   allow_credentials=True,
   allow_methods = ["*"],
   allow_headers = ["*"],
)

# Database Session Dependency
# This ensures each incoming HTTP request gets its own temporary database connection
# and safely closes it when the request is finished, preventing memory leaks.
def get_db():
   db = database.SessionLocal()
   try: yield db
   finally: db.close()

class QuarantineRequest(BaseModel):
   mac_address: str

class RegisterRequest(BaseModel):
   mac_address: str
   email: str

@app.get("/")
def read_root():
   return {"status": "online", "appliance": "ZeroGate", "version": "1.0.0"}

@app.get("/api/devices")
def get_devices(db: Session = Depends(get_db)):
   try:
      devices = db.query(models.ConnectedDevice).all()
      result = []
      
      # Data -> JSON
      for device in devices:
         result.append({
            "id": device.id,
            "mac_address": device.mac_address,
            "ip_address": device.ip_address,
            "email": device.email,
            "custom_label": device.custom_label,
            "is_authenticated": device.is_authenticated,
            "first_seen": device.first_seen.isoformat() if device.first_seen else None,
            "expiration_time": device.expiration_time.isoformat() if device.expiration_time else None
         })
      return {"status": "success", "data": result}
   except Exception as e:
      raise HTTPException(status_code = 500, detail = f"Database error: {str(e)}")

@app.get("/api/alerts")
def get_alerts(db: Session = Depends(get_db)):
   # Query alerts ordered by the most recent timestamp
   alerts = db.query(models.ThreatAlert).order_by(models.ThreatAlert.timestamp.desc()).all()
   
   result = []
   for alert in alerts:
      result.append({
         "id": alert.id,
         "timestamp": alert.timestamp.isoformat() if alert.timestamp else None,
         "signature": alert.signature,
         "severity": alert.severity,
         "action_taken": alert.action_taken,
         # Leverage the relationship to pull the associated device metadata automatically
         "device": {
               "mac_address": alert.device.mac_address if alert.device else "Unknown",
               "email": alert.device.email if alert.device else "N/A",
               "label": alert.device.custom_label if alert.device else "Unknown Device"
         }
      })
   return result

@app.post("/api/register")
def register_guest(req: RegisterRequest, db: Session = Depends(get_db)):
   expiration_time = datetime.now() + timedelta(hours = 2)
   device = db.query(models.ConnectedDevice).filter(models.ConnectedDevice.mac_address == req.mac_address).first()

   if not device:
      device = models.ConnectedDevice(
         mac_address = req.mac_address,
         ip_address = "192.168.4.10",     # hardcoded for now
         email = req.email,
         is_authenticated = True,
         expiration_time = expiration_time 
      )
      db.add(device)
   else:
      device.email = req.email
      device.is_authenticated = True
      device.expiration_time = expiration_time

   db.commit()
   db.refresh(device)

   # Linux Firewall
   network_guard.grant_access(req.mac_address)
   return {"status": "success", "message": f"Internet access granted for {req.email}", "expires_at": expiration_time.isoformat()}

@app.post("/api/quarantine")
def trigger_quarantine(req: QuarantineRequest, db: Session = Depends(get_db)):
   device = db.query(models.ConnectedDevice).filter(models.ConnectedDevice.mac_address == req.mac_address).first()
   
   if not device: raise HTTPException(status_code = 404, detail = "Device not found")
      
   # 2. Slam the Linux firewall shut
   network_guard.quarantine_device(req.mac_address)
   
   # 3. (Optional) Update the device status in the database to show it is blocked
   
   return {"status": "quarantined", "mac": req.mac_address}