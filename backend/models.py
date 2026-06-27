from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import declarative_base, relationship
import datetime

Base = declarative_base()

class ConnectedDevice(Base):
   __tablename__ = 'connected_devices'
   
   id = Column(Integer, primary_key = True, autoincrement = True)
   mac_address = Column(String(17), unique = True, nullable=False, index = True)
   ip_address = Column(String(15), nullable = False)
   
   # Captured via Next.js React Landing Page
   email = Column(String(100), nullable = True) 
   custom_label = Column(String(50), nullable = True)
   
   # Zero Trust Status
   is_authenticated = Column(Boolean, default = False)
   first_seen = Column(DateTime, default=datetime.datetime.utcnow)
   
   # Relationship to threats
   alerts = relationship("ThreatAlert", back_populates = "device")

class ThreatAlert(Base):
   __tablename__ = 'threat_alerts'
   
   id = Column(Integer, primary_key = True, autoincrement = True)
   device_id = Column(Integer, ForeignKey('connected_devices.id'))
   timestamp = Column(DateTime, default=datetime.datetime.utcnow)
   
   # Parsed from Suricata eve.json
   signature = Column(String(255), nullable = False) # e.g., "ET SCAN Nmap OS Detection"
   severity = Column(Integer, nullable = False)      # 1=Critical, 2=Medium, 3=Low
   
   # Mitigation Status
   action_taken = Column(String(50), default = "logged") # "logged", "quarantined", "ignored"
   
   device = relationship("ConnectedDevice", back_populates = "alerts")