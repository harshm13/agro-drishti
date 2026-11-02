"""AgroDrishti CLI Bootstrap Utility for Administrator Creation / Promotion.

Usage:
    Interactive (recommended):
        python backend/create_admin.py

    Non-interactive / Automated testing:
        python backend/create_admin.py --name "Admin User" --email "admin@agrodrishti.org" --password "StrongPass123"

    Promote existing user:
        python backend/create_admin.py --promote --email "user@agrodrishti.org"
"""

import sys
import os
import argparse
import getpass
from pathlib import Path

# Ensure UTF-8 console output on Windows
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import init_db, get_connection, create_user, get_user_by_email


def main():
    parser = argparse.ArgumentParser(description="Create or promote an AgroDrishti administrator account.")
    parser.add_argument("--name", type=str, help="Full Name of the administrator")
    parser.add_argument("--email", type=str, help="Email address of the administrator")
    parser.add_argument("--password", type=str, help="Password (min 8 characters)")
    parser.add_argument("--promote", action="store_true", help="Promote an existing user by email to admin role")

    args = parser.parse_args()

    # Ensure database is initialized
    init_db()

    email = args.email
    if not email:
        email = input("Enter admin email: ").strip()

    clean_email = email.strip().lower()
    if not clean_email or "@" not in clean_email:
        print("[!] Error: A valid email address is required.")
        sys.exit(1)

    existing = get_user_by_email(clean_email)

    if args.promote or (existing and not args.name):
        if not existing:
            print(f"[!] Error: No user found with email '{clean_email}'.")
            sys.exit(1)
        if existing['role'] == 'admin':
            print(f"[*] User '{clean_email}' is already an administrator.")
            sys.exit(0)

        conn = get_connection()
        try:
            with conn:
                conn.execute("UPDATE users SET role = 'admin' WHERE id = ?", (existing['id'],))
            print(f"[OK] Successfully promoted '{clean_email}' (ID: {existing['id']}) to administrator.")
            sys.exit(0)
        finally:
            conn.close()

    if existing:
        print(f"[!] User '{clean_email}' already exists. Use --promote to upgrade their role.")
        sys.exit(1)

    name = args.name
    if not name:
        name = input("Enter admin full name: ").strip()
    if not name:
        name = "Administrator"

    password = args.password
    if not password:
        password = getpass.getpass("Enter secure password (min 8 characters): ")
        confirm = getpass.getpass("Confirm password: ")
        if password != confirm:
            print("[!] Error: Passwords do not match.")
            sys.exit(1)

    if len(password) < 8:
        print("[!] Error: Password must be at least 8 characters.")
        sys.exit(1)

    try:
        user = create_user(name=name, email=clean_email, password=password, role='admin')
        print(f"[OK] Administrator account created successfully!")
        print(f"    ID:    {user['id']}")
        print(f"    Name:  {user['name']}")
        print(f"    Email: {user['email']}")
        print(f"    Role:  {user['role']}")
    except Exception as e:
        print(f"[!] Failed to create administrator: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
