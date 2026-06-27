import subprocess
import platform

class FirewallController:
   def __init__(self):
      self.os_type = platform.system()
      self.is_production = self.os_type == "Linux"
      
      if self.is_production:
         print("🛡️ ZeroGate Firewall initialized in PRODUCTION mode (iptables active).")
      else:
         print(f"⚠️ ZeroGate Firewall initialized in DEV mode ({self.os_type}). Simulating commands.")

   def grant_access(self, mac_address: str):
      """Adds a MAC address to the iptables ALLOW list."""
      if self.is_production:
         # The actual Linux command to let a device bypass the captive portal
         cmd = f"sudo iptables -I FORWARD -m mac --mac-source {mac_address} -j ACCEPT"
         subprocess.run(cmd.split(), check=False)
         print(f"✅ [LINUX] Internet granted to {mac_address}")
      else:
         print(f"💻 [DEV SIMULATION] -> Executed rule to GRANT access for {mac_address}")

   def quarantine_device(self, mac_address: str):
      """Removes a MAC address from the ALLOW list, dropping their packets."""
      if self.is_production:
         # The actual Linux command to cut off their internet
         cmd = f"sudo iptables -D FORWARD -m mac --mac-source {mac_address} -j ACCEPT"
         subprocess.run(cmd.split(), check=False)
         print(f"🚫 [LINUX] Quarantined {mac_address}. Internet access revoked.")
      else:
         print(f"💻 [DEV SIMULATION] -> Executed rule to QUARANTINE {mac_address}")

# Create a single instance to be used by the FastAPI server
network_guard = FirewallController()