from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List

# --- SCHEMAS - THREAT ALERTS ---
class ThreatAlertBase(BaseModel):
   signature: str
   severity: int
   action_taken: Optional[str] = "logged"

class ThreatAlertResponse(ThreatAlertBase):
   id: int
   timestamp: datetime
   device_id: int
   model_config = ConfigDict(from_attributes = True) 

# --- SCHEMAS - CONNECTED DEVICES ---
class DeviceBase(BaseModel):
   mac_address: str
   ip_address: str
   email: Optional[str] = None
   custom_label: Optional[str] = None
   is_authenticated: Optional[bool] = False
   is_blocked: Optional[bool] = False
   risk_level: Optional[str] = "None"

class DeviceResponse(DeviceBase):
   id: int
   first_seen: datetime
   expiration_time: Optional[datetime] = None
   alerts: List[ThreatAlertResponse] = []
   model_config = ConfigDict(from_attributes = True)

# --- SCHEMAS - REQUESTS ---
class ActionRequest(BaseModel):
   mac_address: str

class RegisterRequest(BaseModel):
   email: str
   password: str

class GuestRegistration(BaseModel):
   mac_address: str
   email: str