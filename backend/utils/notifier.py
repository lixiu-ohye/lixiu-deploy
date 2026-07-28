"""
错误通知系统
支持：邮件、钉钉、飞书、企业微信
"""
import smtplib
import json
import httpx
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from typing import Optional, Dict, Any
from loguru import logger
from config import settings


class Notifier:
    def __init__(self):
        self.channels = {
            'email': EmailChannel(),
            'dingtalk': DingTalkChannel(),
            'feishu': FeishuChannel(),
            'wechat_work': WeChatWorkChannel(),
        }

    async def send_alert(self, title: str, message: str, level: str = "warning", channels: list = None):
        if channels is None:
            channels = ['email']
        for channel in channels:
            if channel in self.channels:
                try:
                    await self.channels[channel].send(title, message, level)
                except Exception as e:
                    logger.error(f"通知发送失败 [{channel}]: {e}")

    async def send_error(self, error: Exception, context: Dict[str, Any] = None):
        title = f"🚨 系统错误: {type(error).__name__}"
        message = f"""
错误类型: {type(error).__name__}
错误信息: {str(error)}
发生时间: {datetime.now().isoformat()}
上下文: {json.dumps(context or {}, ensure_ascii=False, indent=2)}
"""
        await self.send_alert(title, message, level="critical")


class EmailChannel:
    def __init__(self):
        self.smtp_host = getattr(settings, 'SMTP_HOST', 'smtp.gmail.com')
        self.smtp_port = getattr(settings, 'SMTP_PORT', 587)
        self.username = getattr(settings, 'SMTP_USER', '')
        self.password = getattr(settings, 'SMTP_PASSWORD', '')
        self.alert_email = getattr(settings, 'ALERT_EMAIL', '')

    async def send(self, title: str, message: str, level: str):
        msg = MIMEMultipart()
        msg['From'] = self.username
        msg['To'] = self.alert_email
        msg['Subject'] = f"[{level.upper()}] {title}"
        html = f"""
<html><body style="font-family:Arial,sans-serif;padding:20px">
<div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:20px;border-radius:10px">
<h2 style="color:white;margin:0">{title}</h2></div>
<div style="padding:20px;background:#f8f9fa;border-radius:10px;margin-top:10px">
<pre style="white-space:pre-wrap;font-family:monospace">{message}</pre></div>
<p style="color:#6c757d;font-size:12px">此邮件由 哩修 AI影像助手 自动发送</p>
</body></html>"""
        msg.attach(MIMEText(html, 'html'))
        with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
            server.starttls()
            server.login(self.username, self.password)
            server.send_message(msg)


class DingTalkChannel:
    def __init__(self):
        self.webhook_url = getattr(settings, 'DINGTALK_WEBHOOK', '')

    async def send(self, title: str, message: str, level: str):
        if not self.webhook_url: return
        emoji = {'info': 'ℹ️', 'warning': '⚠️', 'critical': '🚨'}
        data = {"msgtype": "markdown", "markdown": {"title": title, "text": f"## {emoji.get(level,'📢')} {title}\n\n{message}\n\n---\n*哩修 AI影像助手*"}}
        async with httpx.AsyncClient() as client:
            await client.post(self.webhook_url, json=data)


class FeishuChannel:
    def __init__(self):
        self.webhook_url = getattr(settings, 'FEISHU_WEBHOOK', '')

    async def send(self, title: str, message: str, level: str):
        if not self.webhook_url: return
        color = {'info': 'blue', 'warning': 'yellow', 'critical': 'red'}
        data = {"msg_type": "interactive", "card": {"header": {"title": {"tag": "plain_text", "content": title}, "template": color.get(level, 'blue')}, "elements": [{"tag": "div", "text": {"tag": "plain_text", "content": message[:3000]}}]}}
        async with httpx.AsyncClient() as client:
            await client.post(self.webhook_url, json=data)


class WeChatWorkChannel:
    def __init__(self):
        self.webhook_url = getattr(settings, 'WECHAT_WORK_WEBHOOK', '')

    async def send(self, title: str, message: str, level: str):
        if not self.webhook_url: return
        data = {"msgtype": "text", "text": {"content": f"[{level.upper()}] {title}\n\n{message[:2000]}"}}
        async with httpx.AsyncClient() as client:
            await client.post(self.webhook_url, json=data)


notifier = Notifier()
