from mitmproxy import http
import logging

async def request(flow: http.HTTPFlow) -> None:
    # Check if the path ends with 'proxy/forward-to'
    if flow.request.path.endswith("proxy/forward-to"):
        flow.request.headers["bypass-tunnel-reminder"] = "ok"
        logging.info("Added bypass-tunnel-reminder header to: %s", flow.request.url)