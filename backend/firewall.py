import subprocess, platform

class FirewallController:
   def __init__(self):
      self.os_type = platform.system()
      self.is_production = self.os_type == "Linux"
      
      if self.is_production: print("🛡️ [FIREWALL]: Initialized in PRODUCTION mode (iptables active).")
      else: print(f"⚠️ [DEV]: Initialized in DEV mode ({self.os_type}). Simulating commands.")

   def _run_cmd(self, cmd: str):
      """Helper para ejecutar comandos silenciosamente y capturar errores si los hay"""
      if not self.is_production: return
      try: subprocess.run(cmd.split(), check = True, stdout = subprocess.DEVNULL, stderr = subprocess.PIPE)
      except subprocess.CalledProcessError as e: pass

   def _rule_exists(self, rule: str) -> bool:
      """Verifica si una regla específica ya existe en iptables usando la bandera -C (Check)"""
      if not self.is_production: return False
      check_cmd = rule.replace("-I ", "-C ").replace("-D ", "-C ")
      result = subprocess.run(check_cmd.split(), stdout = subprocess.DEVNULL, stderr = subprocess.DEVNULL)
      return result.returncode == 0

   def grant_access(self, mac_address: str):
      """Adds a MAC address to the iptables ALLOW list."""
      fwd_rule = f"sudo iptables -I FORWARD -m mac --mac-source {mac_address} -j ACCEPT"
      nat_rule = f"sudo iptables -t nat -I PREROUTING -m mac --mac-source {mac_address} -j ACCEPT"

      if self.is_production:
         if not self._rule_exists(fwd_rule): self._run_cmd(fwd_rule)
         if not self._rule_exists(nat_rule): self._run_cmd(nat_rule)
         print(f"✅ [LINUX]: Internet access GRANTED to {mac_address}")
      else: 
         print(f"- [DEV]:   Internet access GRANTED to {mac_address}")

   def revoke_access(self, mac_address: str):
      """Removes a MAC address from the ALLOW list (Time expired/Normal logout)."""
      fwd_rule = f"sudo iptables -D FORWARD -m mac --mac-source {mac_address} -j ACCEPT"
      nat_rule = f"sudo iptables -t nat -D PREROUTING -m mac --mac-source {mac_address} -j ACCEPT"

      if self.is_production:
         while self._rule_exists(fwd_rule): self._run_cmd(fwd_rule)
         while self._rule_exists(nat_rule): self._run_cmd(nat_rule)
         print(f"- [LINUX]: Internet access REVOKED for {mac_address} (Expired)")
      else:
         print(f"- [DEV]:   Internet access REVOKED for {mac_address} (Expired)")

   def block_device(self, mac_address: str):
      """Removes a MAC address from the ALLOW list (Manual/Security block)."""
      fwd_accept = f"sudo iptables -D FORWARD -m mac --mac-source {mac_address} -j ACCEPT"
      nat_accept = f"sudo iptables -t nat -D PREROUTING -m mac --mac-source {mac_address} -j ACCEPT"
      fwd_drop = f"sudo iptables -I FORWARD -m mac --mac-source {mac_address} -j DROP"

      if self.is_production:
         while self._rule_exists(fwd_accept): self._run_cmd(fwd_accept)
         while self._rule_exists(nat_accept): self._run_cmd(nat_accept)
         if not self._rule_exists(fwd_drop): self._run_cmd(fwd_drop)
         print(f"🚫 [LINUX]: Device BLOCKED: {mac_address}")
      else:
         print(f"- [DEV]:   Device BLOCKED: {mac_address}")

   def unblock_device(self, mac_address: str):
      """Removes a MAC address from the blocked (DROP) list."""
      fwd_drop = f"sudo iptables -D FORWARD -m mac --mac-source {mac_address} -j DROP"

      if self.is_production:
         while self._rule_exists(fwd_drop): self._run_cmd(fwd_drop)
         print(f"- [LINUX]: Device RESTORED: {mac_address}")
      else:
         print(f"- [DEV]:   Device RESTORED: {mac_address}")

network_guard = FirewallController()