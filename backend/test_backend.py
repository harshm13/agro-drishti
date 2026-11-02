"""Automated Test Suite for AgroDrishti Backend Authentication & Security APIs.

Tests:
1. User registration, login, session persistence, /api/auth/me, and logout.
2. Authorization barriers: normal user gets 403 Forbidden on admin endpoints.
3. Administrator authorization: admin gets 200 OK on admin endpoints.
4. Tenant data isolation: User A cannot read or delete User B's scan history.
5. Input validation and inference: valid image saves to history when logged in, corrupt image returns 400.
6. Admin demotion safeguard: cannot demote the last admin.
"""

import os
import sys
import tempfile
import unittest
import io
import json
from PIL import Image

# Use an isolated temporary database for testing
test_db_dir = tempfile.mkdtemp()
test_db_file = os.path.join(test_db_dir, "test_agrodrishti.db")
os.environ["AGRO_DB_PATH"] = test_db_file

# Add backend directory to sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

from database import init_db, create_user, get_connection
import app as app_module
from app import app


class AgroDrishtiBackendTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        app.config['TESTING'] = True
        app.config['SECRET_KEY'] = 'test_secret_key_for_unit_tests'
        init_db(test_db_file)

        # Create one pre-seeded admin user and one regular user directly in DB
        cls.admin_user = create_user(
            name="System Admin",
            email="admin@test.org",
            password="AdminPassword123",
            role="admin",
            db_path=test_db_file
        )

        cls.user_b = create_user(
            name="Farmer Ramesh",
            email="ramesh@test.org",
            password="FarmerPassword123",
            role="user",
            db_path=test_db_file
        )

    def setUp(self):
        self.client = app.test_client()

    def test_01_user_registration_login_logout(self):
        """Test registration, session retrieval, and logout flow."""
        # Register new user
        reg_payload = {
            "name": "Kisan Suresh",
            "email": "suresh@test.org",
            "password": "SecurePassword123"
        }
        res = self.client.post("/api/auth/register", json=reg_payload)
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertEqual(data["user"]["email"], "suresh@test.org")
        self.assertEqual(data["user"]["role"], "user")
        self.assertTrue("csrf_token" in data)

        # Verify /api/auth/me reports authenticated
        me_res = self.client.get("/api/auth/me")
        self.assertEqual(me_res.status_code, 200)
        self.assertEqual(me_res.get_json()["user"]["email"], "suresh@test.org")

        # Logout
        logout_res = self.client.post("/api/auth/logout")
        self.assertEqual(logout_res.status_code, 200)

        # /api/auth/me should now be 401
        me_after = self.client.get("/api/auth/me")
        self.assertEqual(me_after.status_code, 401)

        # Re-login with valid password
        login_res = self.client.post("/api/auth/login", json={
            "email": "suresh@test.org",
            "password": "SecurePassword123"
        })
        self.assertEqual(login_res.status_code, 200)
        self.assertEqual(login_res.get_json()["user"]["name"], "Kisan Suresh")

        # Login with bad password should fail
        bad_login = self.client.post("/api/auth/login", json={
            "email": "suresh@test.org",
            "password": "WrongPassword999"
        })
        self.assertEqual(bad_login.status_code, 401)

    def test_02_normal_user_forbidden_on_admin_routes(self):
        """Verify normal user is denied access (403) to admin routes."""
        # Login as User B (farmer)
        login_res = self.client.post("/api/auth/login", json={
            "email": "ramesh@test.org",
            "password": "FarmerPassword123"
        })
        self.assertEqual(login_res.status_code, 200)

        # Attempt to access admin stats
        stats_res = self.client.get("/api/admin/stats")
        self.assertEqual(stats_res.status_code, 403)

        # Attempt to access user management
        users_res = self.client.get("/api/admin/users")
        self.assertEqual(users_res.status_code, 403)

    def test_03_admin_user_permitted_on_admin_routes(self):
        """Verify admin user gets 200 OK on admin endpoints."""
        # Login as Admin
        login_res = self.client.post("/api/auth/login", json={
            "email": "admin@test.org",
            "password": "AdminPassword123"
        })
        self.assertEqual(login_res.status_code, 200)
        csrf_token = login_res.get_json()["csrf_token"]

        # Access admin stats
        stats_res = self.client.get("/api/admin/stats")
        self.assertEqual(stats_res.status_code, 200)
        data = stats_res.get_json()
        self.assertIn("total_users", data)
        self.assertIn("total_scans", data)

        # Access user list
        users_res = self.client.get("/api/admin/users")
        self.assertEqual(users_res.status_code, 200)
        users = users_res.get_json()["users"]
        self.assertTrue(len(users) >= 2)
        # Ensure password_hash is never exposed
        for u in users:
            self.assertNotIn("password_hash", u)

    def test_04_tenant_isolation_scan_history(self):
        """Verify User A cannot delete User B's scan history."""
        # 1. Login as Ramesh (User B) and create a scan record in DB
        self.client.post("/api/auth/login", json={
            "email": "ramesh@test.org",
            "password": "FarmerPassword123"
        })

        conn = get_connection(test_db_file)
        with conn:
            cursor = conn.execute(
                "INSERT INTO scan_history (user_id, disease, confidence, is_healthy) VALUES (?, ?, ?, ?)",
                (self.user_b["id"], "Tomato_Early_blight", 94.5, 0)
            )
            ramesh_scan_id = cursor.lastrowid
        conn.close()

        # 2. Login as Suresh (User A)
        login_a = self.client.post("/api/auth/login", json={
            "email": "suresh@test.org",
            "password": "SecurePassword123"
        })
        csrf_token_a = login_a.get_json()["csrf_token"]

        # Verify Suresh does not see Ramesh's scan
        history_a = self.client.get("/api/history").get_json()["history"]
        scan_ids_a = [s["id"] for s in history_a]
        self.assertNotIn(ramesh_scan_id, scan_ids_a)

        # Suresh attempts to delete Ramesh's scan -> should fail 404
        del_res = self.client.delete(
            f"/api/history/{ramesh_scan_id}",
            headers={"X-CSRF-Token": csrf_token_a}
        )
        self.assertEqual(del_res.status_code, 404)

        # Verify Ramesh's scan still exists in database
        conn = get_connection(test_db_file)
        row = conn.execute("SELECT id FROM scan_history WHERE id = ?", (ramesh_scan_id,)).fetchone()
        conn.close()
        self.assertIsNotNone(row)

    def test_05_predict_valid_image_and_rejection(self):
        """Test /predict with valid image (saved to history when logged in) and corrupt file rejection."""
        # Login as Suresh
        login_res = self.client.post("/api/auth/login", json={
            "email": "suresh@test.org",
            "password": "SecurePassword123"
        })
        self.assertEqual(login_res.status_code, 200)

        # Generate a synthetic 150x150 RGB JPEG
        img = Image.new("RGB", (150, 150), color=(40, 160, 50))
        img_bytes = io.BytesIO()
        img.save(img_bytes, format="JPEG")
        img_bytes.seek(0)

        # Valid predict request
        pred_res = self.client.post(
            "/predict",
            data={"image": (img_bytes, "tomato_test.jpg")},
            content_type="multipart/form-data"
        )
        self.assertEqual(pred_res.status_code, 200)
        data = pred_res.get_json()
        self.assertIn("disease", data)
        self.assertIn("confidence", data)
        self.assertIn("solution", data)
        self.assertTrue(data.get("saved_to_history"))

        # Verify Suresh's history now contains the scan
        hist_res = self.client.get("/api/history")
        self.assertEqual(hist_res.status_code, 200)
        scans = hist_res.get_json()["history"]
        self.assertTrue(len(scans) > 0)
        self.assertEqual(scans[0]["disease"], data["disease"])

        # Test corrupt non-image file
        corrupt_bytes = io.BytesIO(b"Not an image file at all!")
        bad_res = self.client.post(
            "/predict",
            data={"image": (corrupt_bytes, "malicious.exe")},
            content_type="multipart/form-data"
        )
        self.assertEqual(bad_res.status_code, 400)
        self.assertIn("Corrupt or unreadable", bad_res.get_json()["error"])

    def test_06_admin_demote_safeguard(self):
        """Verify the system prevents demoting the last admin."""
        # Login as Admin
        login_res = self.client.post("/api/auth/login", json={
            "email": "admin@test.org",
            "password": "AdminPassword123"
        })
        csrf_token = login_res.get_json()["csrf_token"]

        # Attempt to demote self when only 1 admin exists
        demote_res = self.client.put(
            f"/api/admin/users/{self.admin_user['id']}/role",
            json={"role": "user"},
            headers={"X-CSRF-Token": csrf_token}
        )
        self.assertEqual(demote_res.status_code, 400)
        self.assertIn("Cannot demote the last remaining administrator", demote_res.get_json()["error"])


if __name__ == "__main__":
    unittest.main()

