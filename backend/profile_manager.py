import asyncio
import random
from pathlib import Path
from typing import Dict, List, Optional

from playwright.async_api import async_playwright

from .config import SCREENSHOT_BASE
from .database import insert_progress


PROFILE_TEMPLATES: List[Dict[str, object]] = [
    {
        "id": 1,
        "email": "airdrop.farmer01@gmail.com",
        "wallet": "0xDEADBEEF0100000000000000000000000000",
        "chrome_port": 9222,
        "ip_address": "192.168.1.101",
        "location": "New York, USA",
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "timezone": "America/New_York",
        "language": "en-US",
    },
    {
        "id": 2,
        "email": "airdrop.farmer02@gmail.com",
        "wallet": "0xDEADBEEF0200000000000000000000000000",
        "chrome_port": 9223,
        "ip_address": "192.168.1.102",
        "location": "London, UK",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "timezone": "Europe/London",
        "language": "en-GB",
    },
    {
        "id": 3,
        "email": "airdrop.farmer03@gmail.com",
        "wallet": "0xDEADBEEF0300000000000000000000000000",
        "chrome_port": 9224,
        "ip_address": "192.168.1.103",
        "location": "Tokyo, Japan",
        "user_agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "timezone": "Asia/Tokyo",
        "language": "ja-JP",
    },
    {
        "id": 4,
        "email": "airdrop.farmer04@gmail.com",
        "wallet": "0xDEADBEEF0400000000000000000000000000",
        "chrome_port": 9225,
        "ip_address": "192.168.1.104",
        "location": "Berlin, Germany",
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        "timezone": "Europe/Berlin",
        "language": "de-DE",
    },
    {
        "id": 5,
        "email": "airdrop.farmer05@gmail.com",
        "wallet": "0xDEADBEEF0500000000000000000000000000",
        "chrome_port": 9226,
        "ip_address": "192.168.1.105",
        "location": "Paris, France",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "timezone": "Europe/Paris",
        "language": "fr-FR",
    },
    {
        "id": 6,
        "email": "airdrop.farmer06@gmail.com",
        "wallet": "0xDEADBEEF0600000000000000000000000000",
        "chrome_port": 9227,
        "ip_address": "192.168.1.106",
        "location": "Sydney, Australia",
        "user_agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "timezone": "Australia/Sydney",
        "language": "en-AU",
    },
    {
        "id": 7,
        "email": "airdrop.farmer07@gmail.com",
        "wallet": "0xDEADBEEF0700000000000000000000000000",
        "chrome_port": 9228,
        "ip_address": "192.168.1.107",
        "location": "Singapore",
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        "timezone": "Asia/Singapore",
        "language": "en-SG",
    },
    {
        "id": 8,
        "email": "airdrop.farmer08@gmail.com",
        "wallet": "0xDEADBEEF0800000000000000000000000000",
        "chrome_port": 9229,
        "ip_address": "192.168.1.108",
        "location": "Toronto, Canada",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
        "timezone": "America/Toronto",
        "language": "en-CA",
    },
    {
        "id": 9,
        "email": "airdrop.farmer09@gmail.com",
        "wallet": "0xDEADBEEF0900000000000000000000000000",
        "chrome_port": 9230,
        "ip_address": "192.168.1.109",
        "location": "São Paulo, Brazil",
        "user_agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        "timezone": "America/Sao_Paulo",
        "language": "pt-BR",
    },
    {
        "id": 10,
        "email": "airdrop.farmer10@gmail.com",
        "wallet": "0xDEADBEEF1000000000000000000000000000",
        "chrome_port": 9231,
        "ip_address": "192.168.1.110",
        "location": "Dubai, UAE",
        "user_agent": "Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
        "timezone": "Asia/Dubai",
        "language": "ar-AE",
    },
]


def get_profiles() -> List[Dict[str, object]]:
    return PROFILE_TEMPLATES


async def capture_screenshot(airdrop_id: int, profile_id: int, page_url: str, page_content: Optional[str] = None) -> str:
    screenshot_dir = SCREENSHOT_BASE / str(airdrop_id) / str(profile_id)
    screenshot_dir.mkdir(parents=True, exist_ok=True)
    screenshot_path = screenshot_dir / f"{int(asyncio.get_event_loop().time() * 1000)}.png"

    profile = next((p for p in PROFILE_TEMPLATES if p["id"] == profile_id), None)
    context_options = {"viewport": {"width": 1280, "height": 800}}
    if profile:
        context_options["user_agent"] = profile["user_agent"]
        context_options["locale"] = profile["language"]
        context_options["timezone_id"] = profile["timezone"]

    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        context = await browser.new_context(**context_options)
        page = await context.new_page()
        await page.goto(page_url, timeout=30000)
        await asyncio.sleep(random.uniform(1.5, 3.5))
        await page.screenshot(path=str(screenshot_path))
        await browser.close()

    return str(screenshot_path)


async def run_profile_task(profile: Dict[str, object], airdrop: Dict[str, object], task: Dict[str, object]) -> Dict[str, object]:
    delay = random.uniform(2.0, 5.0)
    await asyncio.sleep(delay)
    screenshot_path = await capture_screenshot(airdrop["id"], profile["id"], airdrop["website"])
    progress_id = insert_progress(profile["id"], task["id"], "DONE", screenshot_path)
    return {
        "profile_id": profile["id"],
        "task_id": task["id"],
        "status": "DONE",
        "screenshot_path": screenshot_path,
        "progress_id": progress_id,
    }


async def staggered_task_sequence(profile: Dict[str, object], airdrop: Dict[str, object], tasks: List[Dict[str, object]]) -> List[Dict[str, object]]:
    results = []
    for task in tasks:
        result = await run_profile_task(profile, airdrop, task)
        results.append(result)
    return results
