from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List
from pydantic import BaseModel
import json
from firewall import network_guard
import database, models
from database import engine

models.Base.metadata.create_all(bind = engine)

app = FastAPI(title = "ZeroGate Core API", version = "1.0.0")

# Enable CORS
app.add_middleware(
   CORSMiddleware,
   allow_origins = ["*"],
   allow_credentials=True,
   allow_methods = ["*"],
   allow_headers = ["*"],
)

# Database Session Dependency
def get_db():
   db = database.SessionLocal()
   try: yield db
   finally: db.close()

# Models
class QuarantineRequest(BaseModel):
   mac_address: str

class RegisterRequest(BaseModel):
   mac_address: str
   email: str

# --- WebSocket Manager ---
class ConnectionManager:
   def __init__(self):
      self.active_connections: List[WebSocket] = []

   async def connect(self, websocket: WebSocket):
      await websocket.accept()
      self.active_connections.append(websocket)

   def disconnect(self, websocket: WebSocket):
      self.active_connections.remove(websocket)

   async def broadcast(self, message: dict):
      text_data = json.dumps(message)
      for connection in self.active_connections:
         await connection.send_text(text_data)

manager = ConnectionManager()

def get_all_devices_payload(db: Session):
   devices = db.query(models.ConnectedDevice).all()
   result = []
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

# Routes
@app.get("/")
def read_root():
   return {"status": "online", "appliance": "ZeroGate", "version": "1.0.0"}

@app.websocket("/ws/devices")
async def websocket_endpoint(websocket: WebSocket):
   await manager.connect(websocket)
   try:
      while True: 
         data = await websocket.receive_text()
   except WebSocketDisconnect: 
      manager.disconnect(websocket)

@app.get("/api/devices")
def get_devices(db: Session = Depends(get_db)):
   try: get_all_devices_payload(db)
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
         "device": {
               "mac_address": alert.device.mac_address if alert.device else "Unknown",
               "email": alert.device.email if alert.device else "N/A",
               "label": alert.device.custom_label if alert.device else "Unknown Device"
         }
      })
   return result

@app.post("/api/register")
async def register_guest(req: RegisterRequest, db: Session = Depends(get_db)):
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
   await manager.broadcast(get_all_devices_payload(db))
   return {"status": "success", "message": f"Internet access granted for {req.email}", "expires_at": expiration_time.isoformat()}

@app.post("/api/quarantine")
async def trigger_quarantine(req: QuarantineRequest, db: Session = Depends(get_db)):
   device = db.query(models.ConnectedDevice).filter(models.ConnectedDevice.mac_address == req.mac_address).first()
   
   if not device: raise HTTPException(status_code = 404, detail = "Device not found")
      
   network_guard.quarantine_device(req.mac_address)
   device.is_authenticated = False
   db.commit()
   
   await manager.broadcast(get_all_devices_payload(db))
   return {"status": "quarantined", "mac": req.mac_address}

@app.post("/api/internal/trigger-update")
async def trigger_ws_update(db: Session = Depends(get_db)):
   await manager.broadcast(get_all_devices_payload(db))
   return {"status": "broadcast_sent"}