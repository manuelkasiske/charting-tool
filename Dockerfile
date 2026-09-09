FROM python:3.13-slim

WORKDIR /app

# Dependencies first, so that code changes do not discard the pip layer.
COPY app/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./

# /data is overlaid by a bind mount from the host (see docker-compose.yml).
RUN useradd --create-home --uid 10001 chart && mkdir -p /data && chown -R chart /data /app
USER chart

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    DATA_DIR=/data

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s \
  CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8080/healthz',timeout=4).status==200 else 1)"

# --no-server-header: without it "Server: uvicorn" stands in every response
# and reveals to the outside what runs behind the proxy. A "Header always
# unset Server" in the vhost does not suffice for that -- mod_proxy passes the
# backend's header through, and mod_headers comes too late to get rid of it
# again (verified on 2026-09-05). Switching it off at the source works.
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8080", \
     "--proxy-headers", "--forwarded-allow-ips", "*", "--no-server-header"]
