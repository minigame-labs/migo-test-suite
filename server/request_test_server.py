#!/usr/bin/env python3
import json
import time
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler

class RequestTestHandler(BaseHTTPRequestHandler):
    # uncomment above when testing chunked


    def do_GET(self):
        self.handle_request('GET')

    def do_POST(self):
        self.handle_request('POST')

    def do_PUT(self):
        self.handle_request('PUT')

    def do_DELETE(self):
        self.handle_request('DELETE')

    def do_HEAD(self):
        self.handle_request('HEAD')

    def do_OPTIONS(self):
        self.handle_request('OPTIONS')
    
    def do_TRACE(self):
        self.handle_request('TRACE')
        
    def do_CONNECT(self):
        self.handle_request('CONNECT')

    def handle_request(self, method):
        parsed_path = urllib.parse.urlparse(self.path)
        path = parsed_path.path
        query = urllib.parse.parse_qs(parsed_path.query)

        # Echo endpoint - returns request details
        if path == '/echo':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            # Add some custom headers to response to test response headers
            self.send_header('X-Server-Time', str(int(time.time())))
            self.end_headers()
            
            body = None
            try:
                content_len = int(self.headers.get('Content-Length', 0))
                if content_len > 0:
                    # Try to decode as utf-8, if fails, keep as repr
                    raw_body = self.rfile.read(content_len)
                    try:
                        body = raw_body.decode('utf-8')
                        # Try to parse json if content-type is json
                        if 'application/json' in self.headers.get('Content-Type', ''):
                            try:
                                body = json.loads(body)
                            except:
                                pass
                    except:
                        body = str(raw_body)
            except Exception as e:
                print(f"Error reading body: {e}")

            response = {
                'method': method,
                'url': self.path,
                'headers': {k: v for k, v in self.headers.items()},
                'query': query,
                'body': body
            }
            if method != 'HEAD':
                self.wfile.write(json.dumps(response).encode('utf-8'))
            return

        # Delay endpoint
        if path.startswith('/delay/'):
            try:
                delay_ms = int(path.split('/')[-1])
                time.sleep(delay_ms / 1000.0)
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                if method != 'HEAD':
                    self.wfile.write(json.dumps({'status': 'ok', 'delayed': delay_ms}).encode('utf-8'))
            except ValueError:
                self.send_error(400, "Invalid delay value")
            return

        # Status endpoint
        if path.startswith('/status/'):
            try:
                code = int(path.split('/')[-1])
                self.send_response(code)
                self.end_headers()
            except ValueError:
                self.send_error(400, "Invalid status code")
            return

        # JSON endpoint
        if path == '/json':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            if method != 'HEAD':
                self.wfile.write(json.dumps({'foo': 'bar', 'num': 123, 'bool': True}).encode('utf-8'))
            return
            
        # Text endpoint (non-JSON)
        if path == '/text':
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            if method != 'HEAD':
                self.wfile.write(b'Just some plain text')
            return

        # Redirect endpoint
        if path == '/redirect':
            self.send_response(302)
            self.send_header('Location', '/echo?redirected=true')
            self.end_headers()
            return
            
        # Binary endpoint
        if path == '/binary':
            self.send_response(200)
            self.send_header('Content-Type', 'application/octet-stream')
            self.end_headers()
            if method != 'HEAD':
                # Return bytes 0-255
                self.wfile.write(bytes(range(256)))
            return

        # Chunked endpoint
        if path == '/chunked':
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain')
            self.send_header('Transfer-Encoding', 'chunked')
            self.end_headers()
            
            if method != 'HEAD':
                chunks = [b'Chunk1', b'Chunk2', b'Chunk3']
                for chunk in chunks:
                    size = hex(len(chunk))[2:].encode('utf-8')
                    self.wfile.write(size + b'\r\n')
                    self.wfile.write(chunk + b'\r\n')
                    self.wfile.flush()
                    time.sleep(0.5) # Delay between chunks
                
                self.wfile.write(b'0\r\n\r\n')
            return

        self.send_error(404)

if __name__ == '__main__':
    port = 8766
    server = HTTPServer(('0.0.0.0', port), RequestTestHandler)
    print(f'Starting request test server on port {port}...')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped")
        server.shutdown()
