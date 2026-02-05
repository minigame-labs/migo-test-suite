#!/usr/bin/env python3
import asyncio
import argparse
import websockets
from websockets.exceptions import ConnectionClosedOK, ConnectionClosedError

async def echo_handler(websocket):
    req_path = websocket.request.path
    print(f"[open] path={req_path!r}")

    if req_path != "/echo":
        await websocket.close(code=1008, reason="Invalid path")
        return

    try:
        async for message in websocket:
            await websocket.send(message)

    # 正常关闭（含 1000）
    except ConnectionClosedOK:
        pass

    # 非正常关闭（比如 1006 等）
    except ConnectionClosedError as e:
        print(f"[close-error] code={getattr(e, 'code', None)} reason={getattr(e, 'reason', None)!r}")

    finally:
        # websocket 对象上能直接拿到 close_code / close_reason
        print(f"[close] code={websocket.close_code} reason={websocket.close_reason!r}")

async def main(port: int):
    print(f"Starting WebSocket echo server on ws://0.0.0.0:{port}/echo ...")
    async with websockets.serve(echo_handler, "0.0.0.0", port, max_size=2**20):
        await asyncio.Future()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="WebSocket echo server for tests")
    parser.add_argument("--port", "-p", type=int, default=8767)
    args = parser.parse_args()

    try:
        asyncio.run(main(args.port))
    except KeyboardInterrupt:
        print("\nWebSocket server stopped")
