import asyncio
import re
from typing import Any, Dict, List, Optional

from bs4 import BeautifulSoup
from playwright.async_api import async_playwright

from .database import insert_airdrop
from .models import TaskType


SOURCES = [
    "https://example-airdrop-source.com/airdrops",
    "https://example-crypto-farm.com/airdrop-list",
]


FILTER_REJECT = [
    "investment",
    "deposit",
    "trade",
    "liquidity",
    "buy",
    "purchase",
    "holding",
    "staking",
]

FILTER_ACCEPT = [
    "social",
    "faucet",
    "testnet",
    "quiz",
    "discord",
    "telegram",
]


def classify_airdrop(description: str) -> bool:
    lower = description.lower()
    if any(word in lower for word in FILTER_REJECT):
        return False
    return any(word in lower for word in FILTER_ACCEPT)


def parse_tasks_from_text(text: str) -> List[Dict[str, Any]]:
    tasks: List[Dict[str, Any]] = []
    for candidate in re.split(r"[\n\r]+", text):
        candidate = candidate.strip()
        if not candidate:
            continue
        for task_type in TaskType:
            if task_type.value.lower() in candidate.lower():
                tasks.append({"task_name": candidate, "task_type": task_type.value})
                break
    return tasks


async def scrape_airdrop_page(url: str) -> List[Dict[str, Any]]:
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto(url, timeout=30000)
        html = await page.content()
        await browser.close()

    soup = BeautifulSoup(html, "html.parser")
    results: List[Dict[str, Any]] = []

    cards = soup.select(".airdrop-card, .airdrop-item, article, .card")
    for card in cards[:10]:
        title = card.select_one("h2, h3, .title")
        project_name = title.get_text(strip=True) if title else None
        website = card.select_one("a[href]")
        website_url = website["href"] if website else url
        reward_type = "Free"
        deadline_text = card.select_one(".deadline, .date, time")
        deadline = deadline_text.get_text(strip=True) if deadline_text else "2099-12-31T23:59:59"
        description = card.get_text(separator=" ", strip=True)
        if not project_name or not classify_airdrop(description):
            continue

        tasks = parse_tasks_from_text(description)
        if not tasks:
            tasks = [{"task_name": "Social media participation", "task_type": TaskType.SOCIAL.value}]

        results.append(
            {
                "project_name": project_name,
                "website": website_url,
                "reward_type": reward_type,
                "deadline": deadline,
                "claim_link": None,
                "tasks": tasks,
            }
        )
    return results


async def discover_airdrops() -> List[Dict[str, Any]]:
    found: List[Dict[str, Any]] = []
    for source in SOURCES:
        try:
            page_airdrops = await scrape_airdrop_page(source)
            found.extend(page_airdrops)
        except Exception:
            continue
    return found


async def run_discovery() -> int:
    airDrops = await discover_airdrops()
    inserted = 0
    for item in airDrops:
        insert_airdrop(item, item.get("tasks", []))
        inserted += 1
    return inserted
