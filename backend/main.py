from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import database
import models

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
   try:
      yield db
   finally:
      db.close()

@app.get("/")
def read_root():
   return {"status": "online", "appliance": "ZeroGate", "version": "1.0.0"}

@app.get("/api/devices")
def get_devices(db: Session = Depends(get_db)):
   devices = db.query(models.ConnectedDevice).all()
   
   # Format the relational data neatly into JSON
   result = []
   for device in devices:
      result.append({
         "id": device.id,
         "mac_address": device.mac_address,
         "ip_address": device.ip_address,
         "email": device.email,
         "custom_label": device.custom_label,
         "is_authenticated": device.is_authenticated,
         "first_seen": device.first_seen.isoformat() if device.first_seen else None
      })
   return result

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