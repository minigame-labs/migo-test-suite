#!/usr/bin/env python3
import argparse
import asyncio
from datetime import datetime


def now_text() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def addr_text(addr) -> str:
    if not addr:
        return "unknown"
    if isinstance(addr, tuple):
        return ":".join(str(part) for part in addr)
    return str(addr)


def build_http_response(body: bytes) -> bytes:
    headers = [
        b"HTTP/1.1 200 OK",
        b"Content-Type: text/plain; charset=utf-8",
        f"Content-Length: {len(body)}".encode("ascii"),
        b"Connection: close",
        b""
    ]
    return b"\r\n".join(headers) + b"\r\n" + body


class UdpTestProtocol(asyncio.DatagramProtocol):
    def __init__(self, mode: str):
        self.mode = mode
        self.transport = None
        self.packet_count = 0

    def connection_made(self, transport):
        self.transport = transport
        sockname = transport.get_extra_info("sockname")
        print(f"Starting UDP test server on {sockname} (mode={self.mode})")

    def datagram_received(self, data: bytes, addr):
        self.packet_count += 1
        index = self.packet_count
        print(f"[{now_text()}] [pkt#{index}] recv {len(data)} bytes from {addr_text(addr)}")

        response = self.make_response(data)
        if response is None:
            return

        self.transport.sendto(response, addr)
        print(f"[{now_text()}] [pkt#{index}] sent {len(response)} bytes to {addr_text(addr)}")

    def error_received(self, exc):
        print(f"[{now_text()}] [udp-error] {exc}")

    def connection_lost(self, exc):
        if exc:
            print(f"[{now_text()}] UDP server closed with error: {exc}")
        else:
            print(f"[{now_text()}] UDP server closed")

    def make_response(self, data: bytes):
        if data == b"__MIGO_PING__":
            return b"__MIGO_PONG__"

        if self.mode == "uppercase":
            return data.upper()

        if self.mode == "http":
            return build_http_response(b"migo udp ok")

        return data


async def run_server(host: str, port: int, mode: str):
    loop = asyncio.get_running_loop()
    transport, _ = await loop.create_datagram_endpoint(
        lambda: UdpTestProtocol(mode),
        local_addr=(host, port)
    )

    try:
        await asyncio.Future()
    finally:
        transport.close()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="UDP test server for migo network/udp specs")
    parser.add_argument("--host", default="0.0.0.0", help="bind host, default: 0.0.0.0")
    parser.add_argument("--port", "-p", type=int, default=8769, help="bind port, default: 8769")
    parser.add_argument(
        "--mode",
        choices=["echo", "uppercase", "http"],
        default="echo",
        help="response mode: echo bytes, uppercase bytes, or fixed HTTP payload"
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    try:
        asyncio.run(run_server(args.host, args.port, args.mode))
    except KeyboardInterrupt:
        print("\nUDP test server stopped")


if __name__ == "__main__":
    main()
