import time, requests
from datetime import datetime
import database, models
from firewall import network_guard

API_WEBHOOK_URL = "http://127.0.0.1:8000/api/internal/trigger-update"

def check_expired_sessions():
   """Busca dispositivos expirados, los bloquea y actualiza la BD."""
   db = database.SessionLocal()
   try:
      now = datetime.now()
      
      expired_devices = db.query(models.ConnectedDevice).filter(
         models.ConnectedDevice.is_authenticated == True,
         models.ConnectedDevice.expiration_time <= now
      ).all()

      if expired_devices:
         for device in expired_devices:
            print(f"Tiempo expirado. Bloqueando MAC: {device.mac_address}")
            
            # Close access iptables/nftables
            network_guard.quarantine_device(device.mac_address)
            device.is_authenticated = False
         
         db.commit()
         
         try:
            requests.post(API_WEBHOOK_URL, timeout = 2)
            print("Dashboard actualizado vía WebSocket.")
         except requests.exceptions.RequestException as e:
            print(f"No se pudo notificar a la API: {e}")

   except Exception as e: print(f"Error en base de datos: {e}")
   finally: db.close()

def scan_for_new_devices():
   """
   Opciones futuras:
   - READ /var/lib/misc/dnsmasq.leases
   - USE Scapy scannear paquetes ARP (sniffing)
   """
   # TODO: Physical network detection 
   pass

def start_monitor():
   print("ZeroGate Network Monitor init. Vigilando en segundo plano...")
   
   while True:
      check_expired_sessions()
      scan_for_new_devices()
      time.sleep(10)

if __name__ == "__main__":
   start_monitor()