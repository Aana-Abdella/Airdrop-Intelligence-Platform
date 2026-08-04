import sqlite3

from backend import database


def test_profile_migration_allows_insert_with_legacy_schema(monkeypatch, tmp_path):
    db_path = tmp_path / "legacy.db"
    conn = sqlite3.connect(db_path)
    conn.execute(
        """
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    conn.execute(
        "INSERT INTO users (username, hashed_password) VALUES (?, ?)",
        ("legacy_user", "hash"),
    )
    conn.execute(
        """
        CREATE TABLE profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            wallet TEXT NOT NULL,
            chrome_port INTEGER NOT NULL,
            user_agent TEXT,
            timezone TEXT,
            language TEXT
        )
        """
    )
    conn.execute(
        "INSERT INTO profiles (email, wallet, chrome_port) VALUES (?, ?, ?)",
        ("existing@example.com", "0xexisting", 9222),
    )
    conn.commit()
    conn.close()

    monkeypatch.setattr(database, "DB_PATH", db_path)

    database.create_tables()
    user = database.get_user_by_username("legacy_user")
    profile_id = database.insert_profile(
        user["id"],
        {
            "email": "new@example.com",
            "wallet": "0xnew",
            "chrome_port": 9223,
        },
    )

    profiles = database.get_profiles_by_user(user["id"])
    assert profile_id
    assert [profile["email"] for profile in profiles] == ["existing@example.com", "new@example.com"]
    assert all(profile["created_at"] for profile in profiles)
