"""
统一日志系统
支持：JSON格式、ELK收集、按级别分文件
"""
import os
import sys
import json
import logging
from datetime import datetime
from pathlib import Path
from logging.handlers import RotatingFileHandler, TimedRotatingFileHandler
from loguru import logger
from config import settings


class JSONFormatter(logging.Formatter):
    """JSON格式日志"""

    def format(self, record):
        log_entry = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
            "message": record.getMessage(),
            "service": "lixiu-backend",
            "environment": settings.ENV,
        }

        if record.exc_info and record.exc_info[1]:
            log_entry["exception"] = {
                "type": type(record.exc_info[1]).__name__,
                "message": str(record.exc_info[1]),
            }

        if hasattr(record, 'extra_fields'):
            log_entry.update(record.extra_fields)

        return json.dumps(log_entry, ensure_ascii=False)


class LogConfig:
    """日志配置"""

    def __init__(self):
        self.log_dir = Path("logs")
        self.log_dir.mkdir(exist_ok=True)
        self.level = settings.LOG_LEVEL if hasattr(settings, 'LOG_LEVEL') else "INFO"

    def setup(self):
        """配置日志"""
        logger.remove()

        if settings.ENV == "development":
            logger.add(
                sys.stdout,
                format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
                       "<level>{level: <8}</level> | "
                       "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
                       "<level>{message}</level>",
                level=self.level, colorize=True,
            )
        else:
            logger.add(
                sys.stdout,
                format=lambda record: json.dumps({
                    "timestamp": record["time"].isoformat(),
                    "level": record["level"].name,
                    "message": record["message"],
                    "function": record["function"],
                    "line": record["line"],
                }, ensure_ascii=False),
                level=self.level, serialize=False,
            )

        # 所有日志（按天轮转）
        logger.add(
            self.log_dir / "app_{time:YYYY-MM-DD}.log",
            rotation="00:00", retention="30 days", compression="gz",
            format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level: <8} | {name}:{function}:{line} | {message}",
            level="DEBUG", backtrace=True, diagnose=True,
        )

        # 错误日志单独
        logger.add(
            self.log_dir / "error_{time:YYYY-MM-DD}.log",
            rotation="00:00", retention="90 days", compression="gz",
            format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level: <8} | {name}:{function}:{line} | {message}",
            level="ERROR", backtrace=True, diagnose=True,
        )

        # API访问日志
        logger.add(
            self.log_dir / "api_{time:YYYY-MM-DD}.log",
            rotation="00:00", retention="30 days", compression="gz",
            format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {message}",
            level="INFO",
            filter=lambda record: "api" in record["extra"].get("category", ""),
        )

        # 爬虫日志
        logger.add(
            self.log_dir / "crawler_{time:YYYY-MM-DD}.log",
            rotation="00:00", retention="30 days", compression="gz",
            format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level: <8} | {message}",
            level="INFO",
            filter=lambda record: "crawler" in record["extra"].get("category", ""),
        )

        return logger


log_config = LogConfig()
logger = log_config.setup()
