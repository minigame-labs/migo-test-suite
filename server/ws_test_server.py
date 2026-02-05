#!/usr/bin/env python3
import asyncio
import argparse
import websockets

# ws://0.0.0.0:{port}/echo

async def echo_handler(websocket, path=None):
    req_path = path if path is not None else getattr(websocket, "path", None)

    if req_path != "/echo":
        await websocket.close(code=1008, reason="Invalid path")
        return

    try:
        async for message in websocket:
            await websocket.send(message)
    except websockets.exceptions.ConnectionClosed:
        pass

async def main(port: int):
    print(f"Starting WebSocket echo server on ws://0.0.0.0:{port}/echo ...")
    async with websockets.serve(echo_handler, "0.0.0.0", port, max_size=2**20):
        await asyncio.Future()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="WebSocket echo server for tests")
    parser.add_argument("--port", "-p", type=int, default=8767, help="Server port (default: 8767)")
    args = parser.parse_args()

    try:
        asyncio.run(main(args.port))
    except KeyboardInterrupt:
        print("\nWebSocket server stopped")
