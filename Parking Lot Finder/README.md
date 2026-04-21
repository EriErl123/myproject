# Parking Slot Finder — Minimal prototype

This folder contains a small prototype demonstrating:
- Real-time slot availability (Flask + Socket.IO)
- Map view (Leaflet)
- Simple reservation endpoint

Run locally (Windows PowerShell):

```powershell
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r "Parking Lot Finder/backend/requirements.txt"
python "Parking Lot Finder/backend/app.py"
```

Open http://localhost:5000 in a browser.

Run with Docker (recommended for deployment):

```powershell
docker-compose up --build -d
```

Notes:
- Uses SQLite at `Parking Lot Finder/backend/parking.db` for simple persistence.
- This is a minimal prototype: add authentication, a production DB, and HTTPS before public deployment.
