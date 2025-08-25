"""
In‑memory database for the wage/shift application.

This module provides a simple database abstraction layer for storing
users and their shifts.  In a real application you would use a
persistent database such as SQLite, PostgreSQL or an external
service; however, for demonstration and prototyping purposes, an
in‑memory store suffices.  The classes defined here are small and
stateful, making them easy to extend or swap out later.

Each user record includes a username, e‑mail address and hashed
password.  Shifts are associated with a username and reference a
``Shift`` instance from the ``models`` module.  The database offers
methods to add and fetch users, authenticate a user by verifying
their password via the ``security`` module, and record and query
shifts.
"""

from __future__ import annotations

from typing import Dict, List, Optional

from models import Shift
from security import hash_password, verify_password


class UserRecord:
    """Internal representation of a user stored in the database."""

    def __init__(self, username: str, email: str, password_hash: str):
        self.username = username
        self.email = email
        self.password_hash = password_hash

    def check_password(self, password: str) -> bool:
        return verify_password(password, self.password_hash)


class InMemoryDatabase:
    """A naive in‑memory storage for users and shifts.

    This class is not thread‑safe and should only be used for
    prototyping or unit tests.  It intentionally leaves out
    concurrency control and persistence mechanisms.
    """

    def __init__(self) -> None:
        # Maps usernames to UserRecord
        self._users: Dict[str, UserRecord] = {}
        # Maps usernames to a list of Shift objects
        self._shifts: Dict[str, List[Shift]] = {}

    # --- User management ---
    def add_user(self, username: str, password: str, email: str) -> bool:
        """Create a new user account.

        Returns ``True`` on success and ``False`` if the username
        already exists.  The password is hashed using PBKDF2 before
        storage.
        """
        if username in self._users:
            return False
        pwd_hash = hash_password(password)
        self._users[username] = UserRecord(username, email, pwd_hash)
        self._shifts[username] = []
        return True

    def get_user(self, username: str) -> Optional[UserRecord]:
        """Retrieve a user record by username."""
        return self._users.get(username)

    def authenticate(self, username: str, password: str) -> bool:
        """Verify a username and password combination.

        Returns ``True`` if the credentials are valid, ``False`` otherwise.
        """
        user = self.get_user(username)
        if not user:
            return False
        return user.check_password(password)

    # --- Shift management ---
    def add_shift_for_user(self, username: str, shift: Shift) -> bool:
        """Record a shift worked by the specified user.

        Returns ``True`` if the user exists and the shift was recorded,
        ``False`` otherwise.
        """
        if username not in self._users:
            return False
        self._shifts[username].append(shift)
        return True

    def get_shifts_for_user(self, username: str) -> List[Shift]:
        """Return a list of all shifts recorded for a user."""
        return list(self._shifts.get(username, []))

