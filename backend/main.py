from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from typing import List
from contextlib import asynccontextmanager
import json, os, asyncio
from firewall import network_guard
import database, models, schemas
from database import engine

async def session_executioner():
   """Revokes access to expired sessions"""
   while True:
      await asyncio.sleep(60)
      try:
         db = database.SessionLocal()
         now = datetime.now(timezone.utc)
         
         expired_devices = db.query(models.ConnectedDevice).filter(
            models.ConnectedDevice.is_authenticated == True,
            models.ConnectedDevice.expiration_time <= now
         ).all()

         if expired_devices:
            for device in expired_devices:
               print(f"- [TASK]: Time expired for {device.mac_address}. Revoking...")
               network_guard.revoke_access(device.mac_address)
               device.is_authenticated = False
            
            db.commit()
            await manager.broadcast(get_all_devices_payload(db))
         
         db.close()
      except Exception as e: print(f"⚠️ [TASK]: Executioner error: {e}")

# --- LIFESPAN MANAGER ---
@asynccontextmanager
async def lifespan(app: FastAPI):
   print("🔄 [BOOT SYNC]: Synchronizing network state with iptables...")
   try:
      db = database.SessionLocal()
      now = datetime.now(timezone.utc)
      all_devices = db.query(models.ConnectedDevice).all()
      
      restored_access = 0
      restored_blocks = 0
      
      for device in all_devices:
         if device.is_blocked:
            network_guard.block_device(device.mac_address)
            restored_blocks += 1
         
         elif device.is_authenticated:
            if device.expiration_time and device.expiration_time > now:
               network_guard.grant_access(device.mac_address)
               restored_access += 1
            else:
               device.is_authenticated = False
               network_guard.revoke_access(device.mac_address)
               print(f"- [BOOT SYNC]: Cleared expired session for {device.mac_address}")
               
      db.commit()
      db.close()
      print(f"✅ [BOOT SYNC]: Completed. {restored_access} sessions restored, {restored_blocks} active blocks.")
   except Exception as e: 
      print(f"❌ [BOOT SYNC]: Critical error during synchronization: {e}")

   task = asyncio.create_task(session_executioner())
   yield
   task.cancel()

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

def get_mac_from_ip(ip: str) -> str:
   """Lee la tabla ARP de Linux para encontrar la MAC asociada a una IP"""
   if ip == "127.0.0.1": return "00:00:00:00:00:00"   # Bypass for local host - No ARP table

   try:
      if os.path.exists("/proc/net/arp"):
         with open("/proc/net/arp", "r") as f:
            for line in f:
               if line.startswith(ip + " "):
                  parts = line.split()
                  if len(parts) >= 4: return parts[3].upper()
   except Exception as e: print(f"⚠️ [SYSTEM]: ARP read error: {e}")
   return None

# --- WEBSOCKET MANAGER ---
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
   result = [schemas.DeviceResponse.model_validate(device).model_dump(mode = 'json') for device in devices]
   return {"status": "success", "data": result}

# --- ROUTES ---
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
   try: return get_all_devices_payload(db)
   except Exception as e:
      raise HTTPException(status_code = 500, detail = f"Database error: {str(e)}")

@app.get("/api/alerts")
def get_alerts(db: Session = Depends(get_db)):
   alerts = db.query(models.ThreatAlert).order_by(models.ThreatAlert.timestamp.desc()).all()
   
   result = []
   for alert in alerts:
      result.append({
         "id": alert.id,
         "timestamp": alert.timestamp.isoformat() + "Z" if alert.timestamp and alert.timestamp.tzinfo is None else (alert.timestamp.isoformat() if alert.timestamp else None),
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

@app.get("/api/network/traffic")
def get_visitors_history(db: Session = Depends(get_db)):
   daily_counts = {}
   today = datetime.now(timezone.utc)
   
   for i in range(89, -1, -1):
      day_str = (today - timedelta(days = i)).strftime("%Y-%m-%d")
      daily_counts[day_str] = 0

   ninety_days_ago = today - timedelta(days = 90)
   recent_devices = db.query(models.ConnectedDevice).filter(models.ConnectedDevice.first_seen >= ninety_days_ago).all()

   for device in recent_devices:
      if device.first_seen:
         day_str = device.first_seen.strftime("%Y-%m-%d")
         if day_str in daily_counts: daily_counts[day_str] += 1

   result = [{"date": k, "visitors": v} for k, v in daily_counts.items()]

   return result

@app.post("/api/register")
async def register_guest(req: schemas.RegisterRequest, request: Request, db: Session = Depends(get_db)):
   secret = os.getenv("WIFI_SECRET", "ZeroGate@2026")
   if req.password != secret: raise HTTPException(status_code = 401, detail = "Contraseña de acceso incorrecta")

   client_ip = request.client.host
   client_mac = get_mac_from_ip(client_ip)

   if not client_mac: raise HTTPException(status_code = 400, detail = f"Error de red: No se pudo identificar la MAC para la IP {client_ip}")

   expiration_time = datetime.now(timezone.utc) + timedelta(hours = 2)
   device = db.query(models.ConnectedDevice).filter(models.ConnectedDevice.mac_address == client_mac).first()

   if not device:
      device = models.ConnectedDevice(
         mac_address = client_mac,
         ip_address = client_ip,
         email = req.email,
         is_authenticated = True,
         expiration_time = expiration_time 
      )
      db.add(device)
   else:
      device.email = req.email
      device.ip_address = client_ip
      device.is_authenticated = True
      device.expiration_time = expiration_time

   db.commit()
   db.refresh(device)

   network_guard.grant_access(client_mac) # Grant internet via Linux Firewall
   await manager.broadcast(get_all_devices_payload(db))
   return {"status": "success", "message": f"Internet access granted for {req.email}", "mac": client_mac, "expires_at": expiration_time.isoformat()}

@app.post("/api/revoke")
async def trigger_revoke(req: schemas.ActionRequest, db: Session = Depends(get_db)):
   device = db.query(models.ConnectedDevice).filter(models.ConnectedDevice.mac_address == req.mac_address).first()
   if not device: raise HTTPException(status_code = 404, detail = "Device not found")
      
   network_guard.revoke_access(req.mac_address) 
   device.is_authenticated = False
   device.expiration_time = datetime.now(timezone.utc) - timedelta(minutes = 1) 
   db.commit()
   
   await manager.broadcast(get_all_devices_payload(db))
   return {"status": "revoked", "mac": req.mac_address}

@app.post("/api/block")
async def trigger_block(req: schemas.ActionRequest, db: Session = Depends(get_db)):
   device = db.query(models.ConnectedDevice).filter(models.ConnectedDevice.mac_address == req.mac_address).first()
   if not device: raise HTTPException(status_code = 404, detail = "Device not found")
      
   network_guard.block_device(req.mac_address)
   device.is_authenticated = False
   device.is_blocked = True
   db.commit()
   
   await manager.broadcast(get_all_devices_payload(db))
   return {"status": "blocked", "mac": req.mac_address}

@app.post("/api/unblock")
async def unblock_device(req: schemas.ActionRequest, db: Session = Depends(get_db)):
   device = db.query(models.ConnectedDevice).filter(models.ConnectedDevice.mac_address == req.mac_address).first()
   if not device: raise HTTPException(status_code = 404, detail = "Device not found")
      
   network_guard.unblock_device(req.mac_address)      
   device.is_authenticated = True
   device.is_blocked = False
   db.commit()
   
   await manager.broadcast(get_all_devices_payload(db))
   return {"status": "success", "message": f"Device {req.mac_address} restored successfully", "mac": req.mac_address}

@app.post("/api/internal/trigger-update")
async def trigger_ws_update(db: Session = Depends(get_db)):
   await manager.broadcast(get_all_devices_payload(db))
   return {"status": "broadcast_sent"}