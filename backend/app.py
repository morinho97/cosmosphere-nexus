"""
Cosmosphere Nexus — Flask TLE Proxy Backend
Fetches TLE data from CelesTrak server-side.
If CelesTrak is unreachable, returns realistic mock TLE data instantly.

Run: python app.py
API runs on: http://localhost:5000
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import time
import math
import threading
import random

app = Flask(__name__)
CORS(app)

# ── Config ────────────────────────────────────────────────────────────────────

TLE_SOURCES = { "iss": "https://celestrak.org/SATCAT/TLE/?CATNR=25544&FORMAT=TLE", "starlink": "https://celestrak.org/SATCAT/TLE/?GROUP=starlink&FORMAT=TLE", "gps": "https://celestrak.org/SATCAT/TLE/?GROUP=gps-ops&FORMAT=TLE", "galileo": "https://celestrak.org/SATCAT/TLE/?GROUP=galileo&FORMAT=TLE", "glonass": "https://celestrak.org/SATCAT/TLE/?GROUP=glonass-operational&FORMAT=TLE", "weather": "https://celestrak.org/SATCAT/TLE/?GROUP=weather&FORMAT=TLE", "scientific": "https://celestrak.org/SATCAT/TLE/?GROUP=science&FORMAT=TLE", "communication": "https://celestrak.org/SATCAT/TLE/?GROUP=active&FORMAT=TLE", }

LIMITS = {
    "iss": 1, "starlink": 800, "gps": 40, "galileo": 30,
    "glonass": 30, "weather": 50, "scientific": 80, "communication": 150,
}

CACHE_TTL = 300   # 5 minutes
FETCH_TIMEOUT = 20 # seconds per CelesTrak request

_cache: dict = {}
_cache_lock = threading.Lock()

HEADERS = {"User-Agent": "CosmosphereNexus/1.0 (educational)"}

# ── TLE Parser ─────────────────────────────────────────────────────────────────

def parse_tle_text(text: str, category: str) -> list[dict]:
    lines = [l.strip() for l in text.strip().splitlines() if l.strip()]
    tles = []
    i = 0
    while i < len(lines) - 2:
        name, line1, line2 = lines[i], lines[i+1], lines[i+2]
        if line1.startswith("1 ") and line2.startswith("2 "):
            tles.append({"name": name.lstrip("0 ").strip(), "tle1": line1, "tle2": line2, "category": category})
            i += 3
        else:
            i += 1
    return tles

# ── Mock TLE generator ─────────────────────────────────────────────────────────
# Generates syntactically valid TLE strings so satellite.js can propagate them

def checksum(line: str) -> int:
    total = 0
    for c in line[:-1]:
        if c.isdigit():
            total += int(c)
        elif c == '-':
            total += 1
    return total % 10

def make_tle(norad_id: int, inc_deg: float, raan_deg: float,
             ecc: float, argp_deg: float, ma_deg: float,
             mean_motion: float, name: str) -> dict:
    """Generate a valid TLE pair for satellite.js propagation."""
    # Epoch: 2026/163 (June 12, 2026 ~ day 163)
    epoch = "26163.50000000"
    ecc_str = f"{ecc:.7f}"[2:]  # drop "0."

    line1 = (f"1 {norad_id:05d}U 24001A   {epoch}  .00000100  00000-0  10000-3 0  9990")
    line1 = line1[:68].ljust(68) + str(checksum(line1[:68] + "0"))

    line2_body = (
        f"2 {norad_id:05d} "
        f"{inc_deg:8.4f} "
        f"{raan_deg % 360:8.4f} "
        f"{ecc_str} "
        f"{argp_deg % 360:8.4f} "
        f"{ma_deg % 360:8.4f} "
        f"{mean_motion:11.8f}"
        f"    1"
    )
    line2 = line2_body[:68].ljust(68) + str(checksum(line2_body[:68] + "0"))

    return {"name": name, "tle1": line1, "tle2": line2, "category": ""}

MOCK_PARAMS = {
    "iss":           (1,   51.6,  0,     0.0001, 3.98576 ),
    "starlink":      (800, 53.0,  360,   0.0001, 15.5    ),
    "gps":           (40,  55.0,  360,   0.001,  2.00566 ),
    "galileo":       (30,  56.0,  360,   0.0002, 1.70474 ),
    "glonass":       (30,  64.8,  360,   0.001,  2.13150 ),
    "weather":       (50,  98.6,  360,   0.001,  14.3    ),
    "scientific":    (80,  97.5,  360,   0.001,  14.5    ),
    "communication": (150, 0.1,   360,   0.0001, 1.00273 ),
}

LABELS = {
    "iss": "ISS", "starlink": "STARLINK", "gps": "GPS-IIF",
    "galileo": "GALILEO", "glonass": "GLONASS", "weather": "NOAA",
    "scientific": "SCISAT", "communication": "COMSAT",
}

def generate_mock_tles(category: str) -> list[dict]:
    if category not in MOCK_PARAMS:
        return []
    count, inc, raan_spread, ecc, mm = MOCK_PARAMS[category]
    tles = []
    planes = max(1, count // 10)
    for i in range(count):
        norad = 50000 + list(MOCK_PARAMS.keys()).index(category) * 1000 + i
        plane = i % planes
        slot  = i // planes
        raan  = (plane / planes) * raan_spread
        ma    = (slot / max(1, count // planes)) * 360
        # Small random offset so satellites aren't perfectly evenly spaced
        ma   += random.uniform(-5, 5)
        raan += random.uniform(-2, 2)
        name  = f"{LABELS.get(category, category.upper())}-{i+1:04d}"
        tle = make_tle(norad, inc, raan, ecc, 0.0, ma, mm, name)
        tle["category"] = category
        tles.append(tle)
    return tles

# ── Fetch with cache + mock fallback ──────────────────────────────────────────

def fetch_category(category: str) -> tuple[list[dict], bool]:
    """Returns (tles, is_real_data)."""
    with _cache_lock:
        cached = _cache.get(category)
        if cached and (time.time() - cached["fetched_at"]) < CACHE_TTL:
            return cached["data"], cached["real"]

    url = TLE_SOURCES.get(category)
    if not url:
        return generate_mock_tles(category), False

    try:
        print(f"[Fetching] {category}...")
        print(url)
        resp = requests.get(url, headers=HEADERS, timeout=FETCH_TIMEOUT)
        resp.raise_for_status()
        text = resp.text
        if "1 " not in text or len(text) < 60:
            raise ValueError("Invalid TLE response")
        tles = parse_tle_text(text, category)
        if not tles:
            raise ValueError("No TLEs parsed")
        with _cache_lock:
            _cache[category] = {"data": tles, "fetched_at": time.time(), "real": True}
        print(f"[OK] {category}: {len(tles)} real satellites")
        return tles, True
    except Exception as e:
        print(f"[MOCK] {category}: CelesTrak unreachable ({e}), returning mock data")
        mock = generate_mock_tles(category)
        with _cache_lock:
            # Cache mock data for shorter time so we retry CelesTrak sooner
            _cache[category] = {"data": mock, "fetched_at": time.time() - CACHE_TTL + 30, "real": False}
        return mock, False

# ── Routes ─────────────────────────────────────────────────────────────────────

@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "service": "Cosmosphere TLE Proxy", "version": "2.0"})

@app.route("/api/tle/<category>")
def get_tle(category: str):
    if category not in TLE_SOURCES:
        return jsonify({"error": f"Unknown category: {category}"}), 404
    limit = request.args.get("limit", type=int, default=LIMITS.get(category, 100))
    tles, real = fetch_category(category)
    return jsonify({
        "category": category,
        "count": len(tles[:limit]),
        "real_data": real,
        "tles": tles[:limit],
    })

@app.route("/api/tle/all")
def get_all_tle():
    result = {}
    sources = {}
    for category in TLE_SOURCES:
        limit = LIMITS.get(category, 100)
        tles, real = fetch_category(category)
        result[category] = tles[:limit]
        sources[category] = "celestrak" if real else "mock"
    return jsonify({
        "categories": result,
        "sources": sources,
        "total": sum(len(v) for v in result.values()),
    })

@app.route("/api/cache/clear", methods=["POST"])
def clear_cache():
    with _cache_lock:
        _cache.clear()
    return jsonify({"status": "cache cleared"})

@app.route("/api/categories")
def list_categories():
    return jsonify({"categories": list(TLE_SOURCES.keys())})

# ── Main ───────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 55)
    print("  Cosmosphere Nexus — TLE Proxy Backend v2.0")
    print("  http://localhost:5000")
    print("  - Real TLE data if CelesTrak reachable")
    print("  - Instant mock TLE data as fallback")
    print("=" * 55)
    app.run(host="0.0.0.0", port=5000, debug=True, use_reloader=False)
