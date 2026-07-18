Necesitas correr ambos servicios en paralelo (backend) y (frontend)

### Backend
```bash
cd backend
python3 -m venv venv                  
source venv/bin/activate              # (Mac/Linux)
pip install -r requirements.txt       
python3 init_db.py                    # Inicializa BD y mock data
uvicorn main:app --reload --port 8000 # Levanta la API local
```

> **Nota:** La API esta en `http://localhost:8000`. Puedes ver y probar todos los endpoints generados automáticamente en `http://localhost:8000/docs`.

### Frontend
```bash
cd frontend                          
npm install                           
npm run dev                           
```

## 🗺️ Roadmap
### Core 
- ✅ [infrastructure] Flash Pi OS Lite [os]
- ✅ [MUST] [infrastructure] Configure network failover & phone hotspot bypass [network]
- ✅ [infrastructure] Establish secure SSH [security]
- ⏳ [MUST] [infrastructure] Configure external USB Wi-Fi adapter [hardware]
- ⏳ [MUST] [infrastructure] Physical testing and routing with a real router [network]

### Finished
- ✅ [MUST] [backend] Base Python module for iptables routing [script]
- ✅ [MUST] [backend] FastAPI local web server to bridge root Linux commands [api]
- ✅ [MUST] [backend] Admin API endpoint to manually sever a specific device's Wi-Fi [api]
### Working on
- ⏳ [MUST] [backend] SQLite DB initialization [db] // Needs 'expiration_time' in models.py
- ⏳ [MUST] [backend] Complete /api/register logic to insert device data into SQLite [api]
- ⏳ [MUST] [backend] Session Enforcer script [script] // Pivot watcher.py to DB expiration checks
- ⏳ [MUST] [frontend] Base Next.js structure, App Router, and Shadcn UI layout [ui]
- ⏳ [MUST] [frontend] Captive Portal landing page UI for guest info [ui]
- ⏳ [MUST] [frontend] View 1: Session Management Table [table] // Timers & "Drop Client" button

### Possible next things
- ⚪ [SHOULD] [backend] Suricata Threat Alert integration [security] // From watcher.py
- ⚪ [SHOULD] [backend] Packet capturing module for bandwidth metrics [script] // tshark/tcpdump
- ⚪ [SHOULD] [backend] Database logging for manual kicks and daily users [db]
- ⚪ [SHOULD] [backend] API endpoints to stream real-time network traffic volume [api]
- ⚪ [SHOULD] [frontend] View 2: Traffic Analysis Charts [chart] // Wireshark-style waves
- ⚪ [SHOULD] [frontend] View 3: Network Health Widget [widget] // Pi CPU/RAM, Ping, active count
- ⚪ [SHOULD] [frontend] View 4: Session History Log [table] // 30-day table of past users

### Not likely
- ❌ [backend] Cloud-hosted backend [cloud] // Defeats air-gapped stealth appliance purpose
- ❌ [frontend] Complex multi-user auth screens [auth] // Physical proximity is the security
- ❌ [backend] External API routing [api] // Security risk; invites external attacks