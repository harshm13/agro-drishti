"""SQLite Database Module for AgroDrishti Backend.

Handles user accounts, password hashing, user scan history, and biotech solution drafts.
Uses Python's standard sqlite3 module with parameterized queries to prevent SQL injection.
"""

import sqlite3
import os
import json
from pathlib import Path
from typing import Optional, List, Dict, Any, Tuple
from werkzeug.security import generate_password_hash, check_password_hash

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'agro_drishti.db')


def get_db_path(custom_path: Optional[str] = None) -> str:
    """Returns the effective database path."""
    return custom_path or os.environ.get('AGRO_DB_PATH', DB_PATH)


def get_connection(db_path: Optional[str] = None) -> sqlite3.Connection:
    """Returns a SQLite connection with foreign keys enabled and row_factory configured."""
    path = get_db_path(db_path)
    conn = sqlite3.connect(path, timeout=10.0)
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.row_factory = sqlite3.Row
    return conn


def init_db(db_path: Optional[str] = None) -> None:
    """Initializes the SQLite database schema if tables do not already exist."""
    conn = get_connection(db_path)
    try:
        with conn:
            conn.executescript("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL COLLATE NOCASE,
                    password_hash TEXT NOT NULL,
                    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS scan_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    disease TEXT NOT NULL,
                    confidence REAL NOT NULL,
                    is_healthy INTEGER NOT NULL CHECK (is_healthy IN (0, 1)),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                );

                CREATE INDEX IF NOT EXISTS idx_scan_history_user ON scan_history(user_id);
                CREATE INDEX IF NOT EXISTS idx_scan_history_created ON scan_history(created_at);

                CREATE TABLE IF NOT EXISTS solution_drafts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    disease_key TEXT NOT NULL,
                    proposed_json TEXT NOT NULL,
                    source_reference TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
                    updated_by INTEGER,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
                );

                CREATE INDEX IF NOT EXISTS idx_solution_drafts_status ON solution_drafts(status);
            """)
    finally:
        conn.close()


def create_user(name: str, email: str, password: str, role: str = 'user', db_path: Optional[str] = None) -> Dict[str, Any]:
    """Creates a new user with hashed password. Role must be 'user' or 'admin'."""
    clean_name = name.strip()
    clean_email = email.strip().lower()

    if not clean_name:
        raise ValueError("Name cannot be empty.")
    if not clean_email or '@' not in clean_email:
        raise ValueError("Valid email is required.")
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters.")
    if role not in ('user', 'admin'):
        raise ValueError("Role must be 'user' or 'admin'.")

    password_hash = generate_password_hash(password, method='pbkdf2:sha256')

    conn = get_connection(db_path)
    try:
        with conn:
            cursor = conn.execute(
                "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
                (clean_name, clean_email, password_hash, role)
            )
            user_id = cursor.lastrowid
            row = conn.execute(
                "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
                (user_id,)
            ).fetchone()
            return dict(row)
    except sqlite3.IntegrityError:
        raise ValueError("A user with this email address already exists.")
    finally:
        conn.close()


def authenticate_user(email: str, password: str, db_path: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Authenticates a user by email and password, returning user dict without password hash."""
    clean_email = email.strip().lower()
    conn = get_connection(db_path)
    try:
        row = conn.execute(
            "SELECT id, name, email, password_hash, role, created_at FROM users WHERE email = ?",
            (clean_email,)
        ).fetchone()

        if row and check_password_hash(row['password_hash'], password):
            user_dict = dict(row)
            user_dict.pop('password_hash', None)
            return user_dict
        return None
    finally:
        conn.close()


def get_user_by_id(user_id: int, db_path: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Fetches user information by ID (excluding password hash)."""
    conn = get_connection(db_path)
    try:
        row = conn.execute(
            "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
            (user_id,)
        ).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


def get_user_by_email(email: str, db_path: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Fetches user information by email (excluding password hash)."""
    clean_email = email.strip().lower()
    conn = get_connection(db_path)
    try:
        row = conn.execute(
            "SELECT id, name, email, role, created_at FROM users WHERE email = ?",
            (clean_email,)
        ).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


def list_users(db_path: Optional[str] = None) -> List[Dict[str, Any]]:
    """Lists all registered users (excluding password hash)."""
    conn = get_connection(db_path)
    try:
        cursor = conn.execute("SELECT id, name, email, role, created_at FROM users ORDER BY id ASC")
        return [dict(row) for row in cursor.fetchall()]
    finally:
        conn.close()


def update_user_role(target_user_id: int, new_role: str, requesting_admin_id: int, db_path: Optional[str] = None) -> Dict[str, Any]:
    """Updates user role with safety guard preventing demotion of the last admin."""
    if new_role not in ('user', 'admin'):
        raise ValueError("Role must be 'user' or 'admin'.")

    conn = get_connection(db_path)
    try:
        with conn:
            target = conn.execute("SELECT id, email, role FROM users WHERE id = ?", (target_user_id,)).fetchone()
            if not target:
                raise ValueError("Target user not found.")

            # Safeguard: Do not demote if it's the last admin
            if target['role'] == 'admin' and new_role == 'user':
                admin_count = conn.execute("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").fetchone()['count']
                if admin_count <= 1:
                    raise ValueError("Cannot demote the last remaining administrator account.")

            conn.execute("UPDATE users SET role = ? WHERE id = ?", (new_role, target_user_id))
            updated = conn.execute("SELECT id, name, email, role, created_at FROM users WHERE id = ?", (target_user_id,)).fetchone()
            return dict(updated)
    finally:
        conn.close()


def add_scan_history(user_id: int, disease: str, confidence: float, is_healthy: bool, db_path: Optional[str] = None) -> int:
    """Inserts a scan metadata entry for the specified user."""
    conn = get_connection(db_path)
    try:
        with conn:
            cursor = conn.execute(
                "INSERT INTO scan_history (user_id, disease, confidence, is_healthy) VALUES (?, ?, ?, ?)",
                (user_id, disease, float(confidence), 1 if is_healthy else 0)
            )
            return cursor.lastrowid
    finally:
        conn.close()


def get_user_scan_history(user_id: int, limit: int = 50, db_path: Optional[str] = None) -> List[Dict[str, Any]]:
    """Returns the scan history belonging only to user_id."""
    conn = get_connection(db_path)
    try:
        cursor = conn.execute(
            "SELECT id, disease, confidence, is_healthy, created_at FROM scan_history WHERE user_id = ? ORDER BY id DESC LIMIT ?",
            (user_id, limit)
        )
        return [
            {
                'id': row['id'],
                'disease': row['disease'],
                'confidence': row['confidence'],
                'is_healthy': bool(row['is_healthy']),
                'created_at': row['created_at']
            }
            for row in cursor.fetchall()
        ]
    finally:
        conn.close()


def delete_scan_history(scan_id: int, user_id: int, db_path: Optional[str] = None) -> bool:
    """Deletes a scan entry ONLY if it belongs to the requesting user_id."""
    conn = get_connection(db_path)
    try:
        with conn:
            cursor = conn.execute(
                "DELETE FROM scan_history WHERE id = ? AND user_id = ?",
                (scan_id, user_id)
            )
            return cursor.rowcount > 0
    finally:
        conn.close()


def get_admin_stats(db_path: Optional[str] = None) -> Dict[str, Any]:
    """Calculates real aggregate statistics across all users and scans."""
    conn = get_connection(db_path)
    try:
        total_users = conn.execute("SELECT COUNT(*) as count FROM users").fetchone()['count']
        total_scans = conn.execute("SELECT COUNT(*) as count FROM scan_history").fetchone()['count']
        healthy_scans = conn.execute("SELECT COUNT(*) as count FROM scan_history WHERE is_healthy = 1").fetchone()['count']
        diseased_scans = conn.execute("SELECT COUNT(*) as count FROM scan_history WHERE is_healthy = 0").fetchone()['count']
        pending_drafts = conn.execute("SELECT COUNT(*) as count FROM solution_drafts WHERE status = 'pending'").fetchone()['count']

        cursor = conn.execute(
            "SELECT disease, COUNT(*) as count FROM scan_history GROUP BY disease ORDER BY count DESC"
        )
        disease_breakdown = {row['disease']: row['count'] for row in cursor.fetchall()}

        return {
            'total_users': total_users,
            'total_scans': total_scans,
            'healthy_scans': healthy_scans,
            'diseased_scans': diseased_scans,
            'pending_drafts': pending_drafts,
            'disease_breakdown': disease_breakdown
        }
    finally:
        conn.close()


def create_solution_draft(disease_key: str, proposed_json: dict, source_reference: str, user_id: Optional[int] = None, db_path: Optional[str] = None) -> int:
    """Creates a new pending biotech solution draft for admin review."""
    if not source_reference.strip():
        raise ValueError("Source reference (e.g., ICAR/KVK bulletin) is required for safety verification.")

    json_str = json.dumps(proposed_json, ensure_ascii=False)
    conn = get_connection(db_path)
    try:
        with conn:
            cursor = conn.execute(
                "INSERT INTO solution_drafts (disease_key, proposed_json, source_reference, status, updated_by) VALUES (?, ?, ?, 'pending', ?)",
                (disease_key, json_str, source_reference.strip(), user_id)
            )
            return cursor.lastrowid
    finally:
        conn.close()


def list_solution_drafts(status: Optional[str] = None, db_path: Optional[str] = None) -> List[Dict[str, Any]]:
    """Lists solution drafts, optionally filtered by status ('pending', 'approved', 'rejected')."""
    conn = get_connection(db_path)
    try:
        if status:
            cursor = conn.execute(
                """
                SELECT d.id, d.disease_key, d.proposed_json, d.source_reference, d.status, d.updated_at,
                       u.name as updater_name, u.email as updater_email
                FROM solution_drafts d
                LEFT JOIN users u ON d.updated_by = u.id
                WHERE d.status = ?
                ORDER BY d.id DESC
                """,
                (status,)
            )
        else:
            cursor = conn.execute(
                """
                SELECT d.id, d.disease_key, d.proposed_json, d.source_reference, d.status, d.updated_at,
                       u.name as updater_name, u.email as updater_email
                FROM solution_drafts d
                LEFT JOIN users u ON d.updated_by = u.id
                ORDER BY d.id DESC
                """
            )

        results = []
        for row in cursor.fetchall():
            item = dict(row)
            try:
                item['proposed_json'] = json.loads(item['proposed_json'])
            except Exception:
                pass
            results.append(item)
        return results
    finally:
        conn.close()


def get_solution_draft_by_id(draft_id: int, db_path: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Retrieves a single solution draft by ID."""
    conn = get_connection(db_path)
    try:
        row = conn.execute(
            """
            SELECT d.id, d.disease_key, d.proposed_json, d.source_reference, d.status, d.updated_at,
                   u.name as updater_name, u.email as updater_email
            FROM solution_drafts d
            LEFT JOIN users u ON d.updated_by = u.id
            WHERE d.id = ?
            """,
            (draft_id,)
        ).fetchone()

        if not row:
            return None
        item = dict(row)
        try:
            item['proposed_json'] = json.loads(item['proposed_json'])
        except Exception:
            pass
        return item
    finally:
        conn.close()


def update_solution_draft_status(draft_id: int, status: str, db_path: Optional[str] = None) -> bool:
    """Updates a draft's status ('approved' or 'rejected')."""
    if status not in ('pending', 'approved', 'rejected'):
        raise ValueError("Status must be 'pending', 'approved', or 'rejected'.")

    conn = get_connection(db_path)
    try:
        with conn:
            cursor = conn.execute(
                "UPDATE solution_drafts SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                (status, draft_id)
            )
            return cursor.rowcount > 0
    finally:
        conn.close()
