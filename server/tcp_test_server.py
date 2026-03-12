#!/usr/bin/env python3
import argparse
import asyncio
from datetime import datetime


def now_text() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def peer_text(peer) -> str:
    if not peer:
        return "unknown"
    if isinstance(peer, tuple):
        return ":".join(str(part) for part in peer)
    return str(peer)


def build_http_response(body: bytes) -> bytes:
    headers = [
        b"HTTP/1.1 200 OK",
        b"Content-Type: text/plain; charset=utf-8",
        f"Content-Length: {len(body)}".encode("ascii"),
        b"Connection: keep-alive",
        b""
    ]
    return b"\r\n".join(headers) + b"\r\n" + body


class TcpTestServer:
    def __init__(self, host: str, port: int, mode: str, idle_timeout: float, read_size: int, close_after_response: bool):
        self.host = host
        self.port = port
        self.mode = mode
        self.idle_timeout = idle_timeout
        self.read_size = read_size
        self.close_after_response = close_after_response
        self.conn_seq = 0

    def next_conn_id(self) -> int:
        self.conn_seq += 1
        return self.conn_seq

    def make_response(self, data: bytes) -> bytes:
        if self.mode == "uppercase":
            return data.upper()

        if self.mode == "http":
            body = b"migo tcp ok"
            return build_http_response(body)

        return data

    async def handle_client(self, reader: asyncio.StreamReader, writer: asyncio.StreamWriter) -> None:
        conn_id = self.next_conn_id()
        peer = peer_text(writer.get_extra_info("peername"))
        local = peer_text(writer.get_extra_info("sockname"))
        print(f"[{now_text()}] [conn#{conn_id}] open peer={peer} local={local}")

        try:
            while True:
                try:
                    data = await asyncio.wait_for(reader.read(self.read_size), timeout=self.idle_timeout)
                except asyncio.TimeoutError:
                    print(f"[{now_text()}] [conn#{conn_id}] idle timeout {self.idle_timeout}s")
                    break

                if not data:
                    break

                print(f"[{now_text()}] [conn#{conn_id}] recv {len(data)} bytes")

                if data == b"__MIGO_CLOSE__":
                    writer.write(b"BYE")
                    await writer.drain()
                    break

                response = self.make_response(data)
                if response:
                    writer.write(response)
                    await writer.drain()
                    print(f"[{now_text()}] [conn#{conn_id}] sent {len(response)} bytes")

                if self.close_after_response:
                    break
        except ConnectionResetError:
            print(f"[{now_text()}] [conn#{conn_id}] connection reset by peer")
        except Exception as exc:
            print(f"[{now_text()}] [conn#{conn_id}] handler error: {exc}")
        finally:
            writer.close()
            try:
                await writer.wait_closed()
            except Exception:
                pass
            print(f"[{now_text()}] [conn#{conn_id}] closed")

    async def run(self) -> None:
        server = await asyncio.start_server(self.handle_client, self.host, self.port)
        bound = ", ".join(str(sock.getsockname()) for sock in (server.sockets or []))
        print(f"Starting TCP test server on {bound} (mode={self.mode})")

        async with server:
            await server.serve_forever()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="TCP test server for migo network/tcp specs")
    parser.add_argument("--host", default="0.0.0.0", help="bind host, default: 0.0.0.0")
    parser.add_argument("--port", "-p", type=int, default=8768, help="bind port, default: 8768")
    parser.add_argument(
        "--mode",
        choices=["echo", "http", "uppercase"],
        default="echo",
        help="response mode: echo raw bytes, fixed http response, or uppercase echo"
    )
    parser.add_argument(
        "--idle-timeout",
        type=float,
        default=30.0,
        help="close idle connection after N seconds (default: 30)"
    )
    parser.add_argument(
        "--read-size",
        type=int,
        default=65536,
        help="socket read chunk size in bytes (default: 65536)"
    )
    parser.add_argument(
        "--close-after-response",
        action="store_true",
        help="close socket after first response"
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    server = TcpTestServer(
        host=args.host,
        port=args.port,
        mode=args.mode,
        idle_timeout=args.idle_timeout,
        read_size=args.read_size,
        close_after_response=args.close_after_response
    )
    try:
        asyncio.run(server.run())
    except KeyboardInterrupt:
        print("\nTCP test server stopped")


if __name__ == "__main__":
    main()
