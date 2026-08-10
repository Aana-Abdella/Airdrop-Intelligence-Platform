import sqlite3
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional

from .config import DB_PATH


def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def create_tables() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with get_db_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                hashed_password TEXT NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                email TEXT NOT NULL,
                wallet TEXT NOT NULL,
                chrome_port INTEGER NOT NULL,
                chrome_profile TEXT,
                x_handle TEXT,
                discord_handle TEXT,
                ip_address TEXT NOT NULL DEFAULT '',
                location TEXT NOT NULL DEFAULT '',
                notes TEXT,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """
        )
        _migrate_profiles_table(conn)
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS airdrops (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                project_name TEXT NOT NULL,
                website TEXT NOT NULL,
                reward_type TEXT NOT NULL,
                reward_amount TEXT,
                deadline TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'NEW',
                claim_link TEXT,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """
        )
        _migrate_airdrops_table(conn)
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                airdrop_id INTEGER NOT NULL,
                task_name TEXT NOT NULL,
                task_type TEXT NOT NULL,
                FOREIGN KEY (airdrop_id) REFERENCES airdrops(id) ON DELETE CASCADE
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                profile_id INTEGER NOT NULL,
                task_id INTEGER NOT NULL,
                status TEXT NOT NULL,
                screenshot_path TEXT,
                timestamp TIMESTAMP NOT NULL,
                FOREIGN KEY (profile_id) REFERENCES profiles(id),
                FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
            )
            """
        )
        _migrate_progress_table(conn)
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                airdrop_id INTEGER NOT NULL,
                platform TEXT NOT NULL,
                message TEXT NOT NULL,
                timestamp TIMESTAMP NOT NULL,
                FOREIGN KEY (airdrop_id) REFERENCES airdrops(id) ON DELETE CASCADE
            )
            """
        )
        _create_indexes(conn)
        conn.commit()


def _migrate_profiles_table(conn: sqlite3.Connection) -> None:
    columns = {row[1] for row in conn.execute("PRAGMA table_info(profiles)").fetchall()}
    if "user_id" not in columns:
        default_user_id = _get_default_user_id(conn)
        conn.execute(f"ALTER TABLE profiles ADD COLUMN user_id INTEGER NOT NULL DEFAULT {default_user_id}")
    if "notes" not in columns:
        conn.execute("ALTER TABLE profiles ADD COLUMN notes TEXT")
    if "created_at" not in columns:
        conn.execute("ALTER TABLE profiles ADD COLUMN created_at TIMESTAMP")
        conn.execute(
            "UPDATE profiles SET created_at = ? WHERE created_at IS NULL",
            (datetime.utcnow().isoformat(),),
        )
    if "ip_address" not in columns:
        conn.execute("ALTER TABLE profiles ADD COLUMN ip_address TEXT NOT NULL DEFAULT ''")
    if "location" not in columns:
        conn.execute("ALTER TABLE profiles ADD COLUMN location TEXT NOT NULL DEFAULT ''")
    if "chrome_profile" not in columns:
        conn.execute("ALTER TABLE profiles ADD COLUMN chrome_profile TEXT")
    if "x_handle" not in columns:
        conn.execute("ALTER TABLE profiles ADD COLUMN x_handle TEXT")
    if "discord_handle" not in columns:
        conn.execute("ALTER TABLE profiles ADD COLUMN discord_handle TEXT")
    if "label" not in columns:
        conn.execute("ALTER TABLE profiles ADD COLUMN label TEXT")
    conn.commit()


def _create_indexes(conn: sqlite3.Connection) -> None:
    indexes = [
        "CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_airdrops_user_status ON airdrops(user_id, status)",
        "CREATE INDEX IF NOT EXISTS idx_tasks_airdrop_id ON tasks(airdrop_id)",
        "CREATE INDEX IF NOT EXISTS idx_progress_profile_task ON progress(profile_id, task_id)",
        "CREATE INDEX IF NOT EXISTS idx_progress_timestamp ON progress(timestamp)",
        "CREATE INDEX IF NOT EXISTS idx_notifications_airdrop_timestamp ON notifications(airdrop_id, timestamp)",
    ]
    for statement in indexes:
        conn.execute(statement)


def _migrate_airdrops_table(conn: sqlite3.Connection) -> None:
    columns = {row[1] for row in conn.execute("PRAGMA table_info(airdrops)").fetchall()}
    if "user_id" not in columns:
        default_user_id = _get_default_user_id(conn)
        conn.execute(f"ALTER TABLE airdrops ADD COLUMN user_id INTEGER NOT NULL DEFAULT {default_user_id}")
    if "reward_amount" not in columns:
        conn.execute("ALTER TABLE airdrops ADD COLUMN reward_amount TEXT")
    conn.commit()


def _migrate_progress_table(conn: sqlite3.Connection) -> None:
    columns = {row[1] for row in conn.execute("PRAGMA table_info(progress)").fetchall()}
    if "timestamp" not in columns:
        conn.execute("ALTER TABLE progress ADD COLUMN timestamp TIMESTAMP")
        if "last_update" in columns:
            conn.execute("UPDATE progress SET timestamp = last_update WHERE timestamp IS NULL")
        conn.execute(
            "UPDATE progress SET timestamp = ? WHERE timestamp IS NULL",
            (datetime.utcnow().isoformat(),),
        )
    conn.commit()


def _get_default_user_id(conn: sqlite3.Connection) -> int:
    demo = conn.execute("SELECT id FROM users WHERE username = ?", ("demo",)).fetchone()
    if demo:
        return int(demo["id"])
    first_user = conn.execute("SELECT id FROM users ORDER BY id LIMIT 1").fetchone()
    return int(first_user["id"]) if first_user else 0


def create_user(username: str, hashed_password: str) -> int:
    with get_db_connection() as conn:
        cursor = conn.execute(
            "INSERT INTO users (username, hashed_password) VALUES (?, ?)",
            (username, hashed_password),
        )
        conn.commit()
        return cursor.lastrowid


def get_user_by_username(username: str) -> Optional[Dict[str, Any]]:
    with get_db_connection() as conn:
        row = conn.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
        return dict(row) if row else None


def insert_airdrop(user_id: int, airdrop: Dict[str, Any], tasks: List[Dict[str, Any]]) -> int:
    with get_db_connection() as conn:
        cursor = conn.execute(
            "INSERT INTO airdrops (user_id, project_name, website, reward_type, reward_amount, deadline, status, claim_link) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (
                user_id,
                airdrop["project_name"],
                airdrop["website"],
                airdrop["reward_type"],
                airdrop.get("reward_amount"),
                airdrop["deadline"],
                airdrop.get("status", "NEW"),
                airdrop.get("claim_link"),
            ),
        )
        airdrop_id = cursor.lastrowid
        for task in tasks:
            conn.execute(
                "INSERT INTO tasks (airdrop_id, task_name, task_type) VALUES (?, ?, ?)",
                (airdrop_id, task["task_name"], task["task_type"]),
            )
        conn.commit()
    return airdrop_id


def update_airdrop_status(airdrop_id: int, status: str) -> None:
    with get_db_connection() as conn:
        conn.execute(
            "UPDATE airdrops SET status = ? WHERE id = ?",
            (status, airdrop_id),
        )
        conn.commit()


def get_airdrops_by_user(user_id: int) -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        airdrops = [dict(row) for row in conn.execute("SELECT * FROM airdrops WHERE user_id = ? ORDER BY created_at DESC", (user_id,)).fetchall()]
        for airdrop in airdrops:
            tasks = [dict(row) for row in conn.execute("SELECT * FROM tasks WHERE airdrop_id = ?", (airdrop["id"],)).fetchall()]
            airdrop["tasks"] = tasks
        return airdrops


def get_airdrop_by_id(airdrop_id: int) -> Optional[Dict[str, Any]]:
    with get_db_connection() as conn:
        row = conn.execute("SELECT * FROM airdrops WHERE id = ?", (airdrop_id,)).fetchone()
        if not row:
            return None
        airdrop = dict(row)
        airdrop["tasks"] = [dict(row) for row in conn.execute("SELECT * FROM tasks WHERE airdrop_id = ?", (airdrop_id,)).fetchall()]
        return airdrop


def get_profiles_by_user(user_id: int) -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        return [dict(row) for row in conn.execute("SELECT * FROM profiles WHERE user_id = ? ORDER BY created_at", (user_id,)).fetchall()]


def get_profile_by_id(profile_id: int) -> Optional[Dict[str, Any]]:
    with get_db_connection() as conn:
        row = conn.execute("SELECT * FROM profiles WHERE id = ?", (profile_id,)).fetchone()
        return dict(row) if row else None


def get_task_by_id(task_id: int) -> Optional[Dict[str, Any]]:
    with get_db_connection() as conn:
        row = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
        return dict(row) if row else None


def insert_profile(user_id: int, profile: Dict[str, Any]) -> int:
    with get_db_connection() as conn:
        created_at = datetime.utcnow().isoformat()
        cursor = conn.execute(
            "INSERT INTO profiles (user_id, email, wallet, chrome_port, chrome_profile, x_handle, discord_handle, ip_address, location, notes, label, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                user_id,
                profile["email"],
                profile["wallet"],
                profile["chrome_port"],
                profile.get("chrome_profile"),
                profile.get("x_handle"),
                profile.get("discord_handle"),
                profile.get("ip_address", ""),
                profile.get("location", ""),
                profile.get("notes"),
                profile.get("label"),
                created_at,
            ),
        )
        conn.commit()
        return cursor.lastrowid


def delete_profile_if_unused(profile_id: int) -> bool:
    """Delete a profile only when no progress/evidence records depend on it."""
    with get_db_connection() as conn:
        progress = conn.execute(
            "SELECT 1 FROM progress WHERE profile_id = ? LIMIT 1", (profile_id,)
        ).fetchone()
        if progress:
            return False
        cursor = conn.execute("DELETE FROM profiles WHERE id = ?", (profile_id,))
        conn.commit()
        return cursor.rowcount == 1


def get_progress_by_airdrop(airdrop_id: int) -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        return [dict(row) for row in conn.execute(
            "SELECT p.* FROM progress p JOIN tasks t ON p.task_id = t.id WHERE t.airdrop_id = ?",
            (airdrop_id,),
        ).fetchall()]


def get_progress_by_user(user_id: int) -> List[Dict[str, Any]]:
    """Return progress owned by a user, including its task and project context."""
    with get_db_connection() as conn:
        return [dict(row) for row in conn.execute(
            """
            SELECT
                p.*,
                t.airdrop_id,
                t.task_name,
                t.task_type,
                a.project_name
            FROM progress p
            JOIN profiles pr ON p.profile_id = pr.id
            JOIN tasks t ON p.task_id = t.id
            JOIN airdrops a ON t.airdrop_id = a.id
            WHERE pr.user_id = ? AND a.user_id = ?
            ORDER BY p.timestamp DESC
            """,
            (user_id, user_id),
        ).fetchall()]


def get_tasks_by_user(user_id: int) -> List[Dict[str, Any]]:
    """Return each campaign task with its latest user-owned progress record."""
    with get_db_connection() as conn:
        rows = conn.execute(
            """
            SELECT
                t.id,
                t.airdrop_id,
                t.task_name,
                t.task_type,
                a.project_name,
                a.status AS campaign_status,
                latest.status,
                latest.timestamp,
                latest.profile_id,
                latest.screenshot_path
            FROM tasks t
            JOIN airdrops a ON t.airdrop_id = a.id
            LEFT JOIN progress latest ON latest.id = (
                SELECT p.id
                FROM progress p
                JOIN profiles pr ON p.profile_id = pr.id
                WHERE p.task_id = t.id AND pr.user_id = ?
                ORDER BY p.timestamp DESC, p.id DESC
                LIMIT 1
            )
            WHERE a.user_id = ?
            ORDER BY a.deadline ASC, t.id ASC
            """,
            (user_id, user_id),
        ).fetchall()
        return [dict(row) for row in rows]


def insert_progress(profile_id: int, task_id: int, status: str, screenshot_path: Optional[str] = None) -> int:
    with get_db_connection() as conn:
        cursor = conn.execute(
            "INSERT INTO progress (profile_id, task_id, status, screenshot_path, timestamp) VALUES (?, ?, ?, ?, ?)",
            (profile_id, task_id, status, screenshot_path, datetime.utcnow().isoformat()),
        )
        conn.commit()
        return cursor.lastrowid


def insert_notification(airdrop_id: int, platform: str, message: str) -> None:
    with get_db_connection() as conn:
        conn.execute(
            "INSERT INTO notifications (airdrop_id, platform, message, timestamp) VALUES (?, ?, ?, ?)",
            (airdrop_id, platform, message, datetime.utcnow().isoformat()),
        )
        conn.commit()


def get_notifications_by_user(user_id: int) -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        return [dict(row) for row in conn.execute(
            "SELECT n.* FROM notifications n JOIN airdrops a ON n.airdrop_id = a.id WHERE a.user_id = ? ORDER BY timestamp DESC",
            (user_id,),
        ).fetchall()]


def get_expired_progress_records(hours: int) -> List[Dict[str, Any]]:
    cutoff = datetime.utcnow() - timedelta(hours=hours)
    with get_db_connection() as conn:
        return [dict(row) for row in conn.execute(
            "SELECT id, screenshot_path FROM progress WHERE timestamp < ? AND status = 'DONE'",
            (cutoff.isoformat(),),
        ).fetchall()]


def delete_progress_records(progress_ids: List[int]) -> int:
    if not progress_ids:
        return 0
    placeholders = ",".join("?" for _ in progress_ids)
    with get_db_connection() as conn:
        cursor = conn.execute(
            f"DELETE FROM progress WHERE id IN ({placeholders})",
            tuple(progress_ids),
        )
        deleted = cursor.rowcount
        conn.commit()
        return deleted
