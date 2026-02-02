#!/usr/bin/env python3
import asyncio
import argparse
import json
import websockets

# Simple WebSocket echo server for testing
# Endpoints:
# - ws://0.0.0.0:{port}/echo : echoes back text or binary messages

async def echo_handler(websocket, path):
    if path != '/echo':
        await websocket.close(code=1008, reason='Invalid path')
        return
    try:
        async for message in websocket:
            if isinstance(message, bytes):
                await websocket.send(message)
            else:
                await websocket.send(message)
    except websockets.exceptions.ConnectionClosed:
        pass

def run_server(port=8767):
    print(f"Starting WebSocket echo server on ws://0.0.0.0:{port}/echo ...")
    start_server = websockets.serve(echo_handler, "0.0.0.0", port, max_size=2**20)

    loop = asyncio.get_event_loop()
    loop.run_until_complete(start_server)
    try:
        loop.run_forever()
    except KeyboardInterrupt:
        print("\nWebSocket server stopped")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="WebSocket echo server for tests")
    parser.add_argument("--port", "-p", type=int, default=8767, help="Server port (default: 8767)")
    args = parser.parse_args()
    run_server(port=args.port)
