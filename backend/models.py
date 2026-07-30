from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime, timezone

class ConnectedDevice(Base):
   __tablename__ = 'connected_devices'

   id = Column(Integer, primary_key = True, autoincrement = True)
   mac_address = Column(String(17), unique = True, nullable = False, index = True)
   ip_address = Column(String(15), nullable = False)
   email = Column(String(100), nullable = True) 
   custom_label = Column(String(50), nullable = True)

   # Status
   is_authenticated = Column(Boolean, default = False)
   is_blocked = Column(Boolean, default = False)
   first_seen = Column(DateTime, default = lambda: datetime.now(timezone.utc))
   expiration_time = Column(DateTime, nullable = True)

   # Threats
   risk_level = Column(String, default = "None")
   alerts = relationship("ThreatAlert", back_populates = "device")

class ThreatAlert(Base):
   __tablename__ = 'threat_alerts'
   
   id = Column(Integer, primary_key = True, autoincrement = True)
   device_id = Column(Integer, ForeignKey('connected_devices.id'))
   timestamp = Column(DateTime, default = lambda: datetime.now(timezone.utc))
   
   # Parsed from Suricata eve.json
   signature = Column(String(255), nullable = False)           # "ET SCAN Nmap OS Detection"
   severity = Column(Integer, nullable = False)                # 1 = Critical, 2 = Medium, 3 = Low
   action_taken = Column(String(50), default = "logged")       # Mitigation Status - "logged", "quarantined", "ignored"
   device = relationship("ConnectedDevice", back_populates = "alerts")