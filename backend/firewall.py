import subprocess, platform

class FirewallController:
   def __init__(self):
      self.os_type = platform.system()
      self.is_production = self.os_type == "Linux"
      
      if self.is_production: print("🛡️ [FIREWALL]: Initialized in PRODUCTION mode (iptables active).")
      else: print(f"⚠️ [DEV]: Initialized in DEV mode ({self.os_type}). Simulating commands.")

   def grant_access(self, mac_address: str):
      """Adds a MAC address to the iptables ALLOW list."""
      if self.is_production:
         cmd = f"sudo iptables -I FORWARD -m mac --mac-source {mac_address} -j ACCEPT"    # Linux command to bypass the captive portal
         subprocess.run(cmd.split(), check = False)
         print(f"✅ [LINUX]: Internet access GRANTED to {mac_address}")
      else: 
         print(f"- [DEV]:   Internet access GRANTED to {mac_address}")

   def revoke_access(self, mac_address: str):
      """Removes a MAC address from the ALLOW list (Time expired/Normal logout)."""
      if self.is_production:
         cmd = f"sudo iptables -D FORWARD -m mac --mac-source {mac_address} -j ACCEPT"    # Linux command to cut off internet
         subprocess.run(cmd.split(), check = False)
         print(f"- [LINUX]: Internet access REVOKED for {mac_address} (Expired)")
      else:
         print(f"- [DEV]:   Internet access REVOKED for {mac_address} (Expired)")

   def quarantine_device(self, mac_address: str):
      """Removes a MAC address from the ALLOW list (Manual/Security block)."""
      # TODO: BLOCK MAC ADDRESS, maybe lets them now they ban
      if self.is_production:
         cmd = f"sudo iptables -D FORWARD -m mac --mac-source {mac_address} -j ACCEPT"
         subprocess.run(cmd.split(), check = False)
         print(f"🚫 [LINUX]: Device QUARANTINED: {mac_address}")
      else:
         print(f"- [DEV]:   Device QUARANTINED: {mac_address}")

network_guard = FirewallController()