from pydantic import BaseModel, ConfigDict, field_validator
from datetime import datetime, timezone
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

   @field_validator('timestamp', mode = 'before')
   @classmethod
   def set_utc(cls, v):
      if isinstance(v, datetime) and v.tzinfo is None: return v.replace(tzinfo = timezone.utc)
      return v

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

   @field_validator('first_seen', 'expiration_time', mode = 'before')
   @classmethod
   def set_utc(cls, v):
      if isinstance(v, datetime) and v.tzinfo is None: return v.replace(tzinfo = timezone.utc)
      return v

# --- SCHEMAS - REQUESTS ---
class ActionRequest(BaseModel):
   mac_address: str

class RegisterRequest(BaseModel):
   email: str
   password: str

class GuestRegistration(BaseModel):
   mac_address: str
   email: str