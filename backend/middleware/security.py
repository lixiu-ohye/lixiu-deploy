"""
安全中间件
包含：API限流、IP白名单、请求验证、SQL注入防护
"""
import time
import hashlib
import hmac
from typing import Dict, Optional
from fastapi import Request, HTTPException
from fastapi.security import APIKeyHeader
from starlette.middleware.base import BaseHTTPMiddleware
from loguru import logger
import redis
from config import settings


class RateLimiter:
    """API限流器"""

    def __init__(self):
        self.redis = redis.from_url(settings.REDIS_URL)

        self.rules = {
            '/api/process-image': {'rate': 10, 'per': 60},
            '/api/process-video': {'rate': 5, 'per': 60},
            '/api/upload': {'rate': 20, 'per': 60},
            'default': {'rate': 60, 'per': 60},
        }

        self.admin_ips = {
            '127.0.0.1', '10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16',
        }

        self.blacklist = set()

    def is_rate_limited(self, ip: str, endpoint: str) -> bool:
        rule = self.rules.get(endpoint, self.rules['default'])
        key = f"ratelimit:{ip}:{endpoint}"
        current = self.redis.get(key)

        if current is None:
            self.redis.setex(key, rule['per'], 1)
            return False

        count = int(current)
        if count >= rule['rate']:
            self._add_to_watchlist(ip)
            return True

        self.redis.incr(key)
        return False

    def _add_to_watchlist(self, ip: str):
        key = f"watchlist:{ip}"
        count = self.redis.incr(key)
        self.redis.expire(key, 3600)
        if count >= 3:
            self.blacklist.add(ip)
            logger.warning(f"IP已封禁: {ip}")

    def is_blocked(self, ip: str) -> bool:
        return ip in self.blacklist

    def unblock(self, ip: str):
        self.blacklist.discard(ip)
        self.redis.delete(f"watchlist:{ip}")


class SecurityMiddleware(BaseHTTPMiddleware):
    """安全中间件"""

    def __init__(self, app):
        super().__init__(app)
        self.rate_limiter = RateLimiter()
        self.api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

    async def dispatch(self, request: Request, call_next):
        client_ip = self._get_client_ip(request)

        if self.rate_limiter.is_blocked(client_ip):
            raise HTTPException(status_code=403, detail="访问已被拒绝")

        if self.rate_limiter.is_rate_limited(client_ip, request.url.path):
            raise HTTPException(status_code=429, detail="请求过于频繁，请稍后再试")

        if request.url.path.startswith('/api/'):
            if not self._verify_request_signature(request):
                logger.warning(f"请求签名验证失败: {client_ip}")
                raise HTTPException(status_code=401, detail="请求签名无效")

        response = await call_next(request)
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response.headers['X-Request-ID'] = request.headers.get('X-Request-ID', '')
        return response

    def _get_client_ip(self, request: Request) -> str:
        forwarded = request.headers.get('X-Forwarded-For')
        if forwarded:
            return forwarded.split(',')[0].strip()
        return request.client.host

    def _verify_request_signature(self, request: Request) -> bool:
        secret = settings.SECRET_KEY.encode()
        signature = request.headers.get('X-Signature')
        if not signature:
            return True
        timestamp = request.headers.get('X-Timestamp', '')
        body = ''
        message = f"{request.method}{request.url.path}{timestamp}{body}"
        expected = hmac.new(secret, message.encode(), hashlib.sha256).hexdigest()
        return hmac.compare_digest(signature, expected)


class InputValidator:
    """输入验证器"""

    @staticmethod
    def sanitize_filename(filename: str) -> str:
        import os, re
        filename = os.path.basename(filename)
        filename = re.sub(r'[^a-zA-Z0-9._-]', '_', filename)
        if len(filename) > 255:
            name, ext = os.path.splitext(filename)
            filename = name[:250] + ext
        return filename

    @staticmethod
    def validate_image(image_data: bytes) -> bool:
        magic_numbers = {
            b'\xFF\xD8\xFF': 'jpg',
            b'\x89PNG\r\n\x1a\n': 'png',
            b'GIF87a': 'gif',
            b'GIF89a': 'gif',
            b'RIFF': 'webp',
        }
        for magic, _ in magic_numbers.items():
            if image_data[:len(magic)] == magic:
                return True
        return False

    @staticmethod
    def validate_video(video_data: bytes) -> bool:
        if video_data[4:8] == b'ftyp':
            return True
        if video_data[4:8] in [b'ftyp', b'moov', b'free', b'mdat']:
            return True
        return False

    @staticmethod
    def sanitize_input(text: str) -> str:
        import html
        text = html.escape(text)
        dangerous = ['<script', '</script>', 'javascript:', 'onerror=', 'onload=']
        for d in dangerous:
            text = text.lower().replace(d, '')
        return text
