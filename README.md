Necesitas correr los servicios en paralelo (backend) y (frontend)

### Backend
```bash
cd backend
python3 -m venv venv                  
source venv/bin/activate                    # (Mac/Linux)
pip install -r requirements.txt       
uvicorn main:app --host 0.0.0.0 --port 8000 # Levanta la API local
python3 watcher.py                          # (Mac/Linux)
```

> **Nota:** La API esta en `http://localhost:8000`. Puedes ver y probar todos los endpoints generados automáticamente en `http://localhost:8000/docs`.

### Frontend
```bash
cd frontend
npm install
npm run dev
```

<details>
  <summary><b>Version 1.0.0</b></summary>
  
  ### Core 
  - ✅ [infrastructure] Flash Pi OS Lite [os]
  - ✅ [MUST] [infrastructure] Configure network failover & phone hotspot bypass [network]
  - ✅ [infrastructure] Establish secure SSH [security]
  - ✅ [MUST] [infrastructure] Configure external USB Wi-Fi adapter [hardware]
  - ✅ [MUST] [infrastructure] Physical testing and routing with a real router [network]

  ### Finished
  - ✅ [MUST] [backend] Base Python module for iptables routing [script]
  - ✅ [MUST] [backend] FastAPI local web server to bridge root Linux commands [api]
  - ✅ [MUST] [backend] Admin API endpoint to manually sever a specific device's Wi-Fi [api]
  - ✅ [MUST] [backend] SQLite DB initialization [db]
  - ✅ [MUST] [backend] Complete /api/register logic to insert device data into SQLite [api]
  - ✅ [MUST] [backend] Session Enforcer script [script]
  - ✅ [SHOULD] [backend] Suricata Threat Alert integration [security] // From watcher.py
  - ✅ [MUST] [frontend] Base Next.js structure, App Router, and Shadcn UI layout [ui]
  - ✅ [MUST] [frontend] Captive Portal landing page UI for guest info [ui]
  - ✅ [MUST] [frontend] View 1: Session Management Table with Timers, Drop, Block & Whitelist [table]
  - ✅ [SHOULD] [frontend] View 2: Threat Activity NOC Dashboard with real-time WebSockets [table]
</details>




## 🗺️ Roadmap 2.0
### Working on
- ⚪ [MUST] [backend] Network Quality of Service (QoS) throttling [network] // Integrar 'tc' en Linux para limitar el ancho de banda (velocidad) por dispositivo.
- ⚪ [MUST] [security] MAC Randomization detection [script]
- ⚪ [MUST] [backend] Local configuration auto-backup [db]
- ⚪ [MUST] [frontend] Persistent known device profiles [ui]

### Possible next things
- ⚪ [SHOULD] [backend] DNS-based content filtering [network]
- ⚪ [SHOULD] [frontend] Dynamic Captive Portal editor [ui]
- ⚪ [SHOULD] [backend] Time-based access schedules [script]
- ⚪ [SHOULD] [frontend] Data export & reporting module [table]
- ⚪ [SHOULD] [backend] Packet capturing module for bandwidth metrics [script]
- ⚪ [SHOULD] [backend] Database logging for manual kicks and daily users [db]
- ⚪ [SHOULD] [frontend] View 3: Network Health Widget [widget]
- ⚪ [COULD] [frontend] Network topology map visualization [widget]
- ⚪ [COULD] [infrastructure] Physical hardware alerts [hardware]

### Not likely
- ❌ [backend] Cloud-hosted backend [cloud]
- ❌ [backend] External API routing [api]
- ❌ [backend] Full packet capture (pcap) storage [db]
- ❌ [frontend] Complex multi-user auth screens [auth]
- ❌ [frontend] Native iOS/Android application [ui]