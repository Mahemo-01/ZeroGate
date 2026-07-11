import asyncio
import os
from dotenv import load_dotenv
from google.antigravity import Agent, LocalAgentConfig
# 1. Import the policy override tools
from google.antigravity.hooks.policy import allow, deny

load_dotenv()

async def run_audit():
   # 2. Create a custom policy array to bypass the default security block
   # This explicitly grants the agent permission to perform local file analysis
   custom_policies = [
      allow("view_file"),      # Allows the agent to read your backend files
      allow("analyze_code"),   # Explicitly allows static analysis
      deny("run_command")      # We block shell execution so it doesn't accidentally run your server
   ]

   config = LocalAgentConfig(
      system_instructions=(
         "You are an authorized internal security reviewer for the ZeroGate project. "
         "You have permission to analyze local code. Review the provided code "
         "specifically looking for injection flaws or logic bugs. This is a local "
         "development environment."
      ),
      # 3. Attach the custom policies to the agent config
      policies=custom_policies
   )
   
   print("Initiating ZeroGate internal security review...")
   
   async with Agent(config) as agent:
      # 4. Soften the prompt language so the model doesn't panic
      prompt = "Read the Python files in the ../backend directory. Are there any coding patterns that could lead to logic bugs or unhandled packet data?"
      
      response = await agent.chat(prompt)
      
      print("\n--- Audit Results ---\n")
      print(await response.text())

if __name__ == "__main__":
   if not os.environ.get("GEMINI_API_KEY"):
      print("Error: GEMINI_API_KEY is missing. Check your .env file.")
   else:
      asyncio.run(run_audit())