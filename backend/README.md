# Cosmosphere Nexus — Flask Backend Setup

## Why this exists
CelesTrak (the satellite TLE data source) blocks direct browser requests (CORS).
This Flask server runs locally and fetches TLE data server-side — no CORS issues.

## Setup (one time)

```bash
cd backend
pip install -r requirements.txt
```

## Run

```bash
# Terminal 1 — Backend (port 5000)
cd backend
python app.py

# Terminal 2 — Frontend (port 5173)
cd ..
npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Check if backend is running |
| GET | `/api/tle/all` | All categories at once (recommended) |
| GET | `/api/tle/<category>` | Single category |
| GET | `/api/categories` | List available categories |
| POST | `/api/cache/clear` | Force fresh fetch from CelesTrak |

### Categories
`iss`, `starlink`, `gps`, `galileo`, `glonass`, `weather`, `scientific`, `communication`

### Example
```bash
curl http://localhost:5000/api/health
curl http://localhost:5000/api/tle/iss
curl http://localhost:5000/api/tle/all
```

## How it works
- TLE data is cached for 5 minutes (CelesTrak updates every 2 hours)
- If the backend is not running, the frontend automatically falls back to realistic mock data
- No API keys needed — CelesTrak is free and public
