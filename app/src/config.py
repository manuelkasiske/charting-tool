"""Configuration from environment variables (see .env in the project folder)."""

import os
from pathlib import Path

# Directory of the SQLite databases. Inside the container this carries a bind
# mount of /srv/docker-volumes/chart/data, so that users, sessions
# and the price cache survive a rebuild of the image.
DATA_DIR = Path(os.getenv("DATA_DIR", "/data"))

APP_DB = DATA_DIR / "app.db"

# Without SECRET_KEY set the application refuses to start (see main.py).
# Generate one with:  python3 -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY = os.getenv("SECRET_KEY", "")

# Lifetime of a session. The short value applies normally, the long one only
# if "stay signed in" was ticked when signing in.
SESSION_HOURS = int(os.getenv("SESSION_HOURS", "12"))
SESSION_REMEMBER_DAYS = int(os.getenv("SESSION_REMEMBER_DAYS", "30"))

# Brute force brake: after MAX_ATTEMPTS failed attempts from the same source
# the account is locked for LOCKOUT_MINUTES.
MAX_ATTEMPTS = int(os.getenv("MAX_ATTEMPTS", "5"))
LOCKOUT_MINUTES = int(os.getenv("LOCKOUT_MINUTES", "15"))

# Cache lifetime in seconds. Closed trading days do not change any more, the
# running day does -- hence two values.
CACHE_TTL_INTRADAY = int(os.getenv("CACHE_TTL_INTRADAY", "900"))
CACHE_TTL_CLOSED = int(os.getenv("CACHE_TTL_CLOSED", "43200"))

# Behind the Apache vhost the connection to the container is unencrypted. The
# Secure flag on the cookie therefore follows this setting, not the scheme of
# the incoming request.
COOKIE_SECURE = os.getenv("COOKIE_SECURE", "true").lower() == "true"

# Access log (see audit.py): sign-ins and charts requested. Deliberately in
# DATA_DIR so that it survives a rebuild of the image.
LOG_FILE = DATA_DIR / os.getenv("LOG_FILE", "access.log")
LOG_MAX_MB = int(os.getenv("LOG_MAX_MB", "5"))
LOG_BACKUPS = int(os.getenv("LOG_BACKUPS", "5"))

# Time zone of the timestamps in the access log. The container runs on UTC,
# but the log is meant to be read by a person in Berlin.
LOG_TIMEZONE = os.getenv("LOG_TIMEZONE", "Europe/Berlin")

# Name in the top bar and above the sign-in form. Everything up to the first
# dot is set in the strong colour, the rest muted, so "chart.example.com"
# reads as one name in two weights.
#
# Configurable rather than written into the template: the repository is
# public, and a particular deployment's domain has no business sitting in it
# -- neither for whoever clones this, nor for whoever runs it.
BRAND = os.getenv("BRAND", "charting-tool")
