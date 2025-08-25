"""
Security utilities for password hashing and verification.

This module provides helper functions to hash and verify user
passwords using the PBKDF2 key‑derivation function built into
Python's standard library.  The design follows recommendations from
the official Python documentation and industry best practices: a
random salt of at least 16 bytes is generated for each password, and
hundreds of thousands of iterations are used to slow down brute‑force
attacks.  See the standard library documentation for details on
choosing sensible parameters【222232032173509†L365-L374】.  The default
implementation here mirrors the example used by Django and Simon
Willison's Datasette project【618303256382420†L20-L38】.

Passwords are stored in the format ``algorithm$iterations$salt$hash``.
Using a structured format allows the hashing parameters to evolve over
time without breaking existing stored hashes.  When verifying a
password, the algorithm and iteration count are extracted from the
stored hash and reused to derive a comparable hash for the candidate
password.  The use of ``secrets.compare_digest`` guards against
timing attacks.
"""

from __future__ import annotations

import base64
import hashlib
import secrets
from typing import Optional

# Algorithm identifier and default iteration count.  The iteration
# count reflects 2022 recommendations to use hundreds of thousands of
# iterations of SHA‑256【222232032173509†L365-L374】.
ALGORITHM = "pbkdf2_sha256"
DEFAULT_ITERATIONS = 260_000

def hash_password(password: str, *, salt: Optional[str] = None, iterations: int = DEFAULT_ITERATIONS) -> str:
    """Hash a plaintext password using PBKDF2.

    Parameters
    ----------
    password : str
        The plaintext password supplied by the user.
    salt : Optional[str], default ``None``
        A hexadecimal string used as salt.  If ``None``, a random salt
        is generated using ``secrets.token_hex``.  The salt must not
        contain the ``$`` character to avoid parsing issues.
    iterations : int, default ``DEFAULT_ITERATIONS``
        Number of PBKDF2 iterations to perform.  Higher numbers
        increase security at the cost of CPU time.  Per the Python
        documentation, hundreds of thousands of iterations are
        recommended【222232032173509†L365-L374】.

    Returns
    -------
    str
        A composite string containing the algorithm, iteration count,
        salt and derived key.
    """
    if salt is None:
        # 16 bytes of randomness as a hex string【222232032173509†L365-L374】.
        salt = secrets.token_hex(16)
    if "$" in salt:
        raise ValueError("Salt must not contain the '$' character")
    if not isinstance(password, str):
        raise TypeError("password must be a string")

    # Derive the key using PBKDF2-HMAC-SHA256
    pwd_bytes = password.encode("utf-8")
    salt_bytes = salt.encode("utf-8")
    dk = hashlib.pbkdf2_hmac("sha256", pwd_bytes, salt_bytes, iterations)
    b64_hash = base64.b64encode(dk).decode("ascii").strip()
    return f"{ALGORITHM}${iterations}${salt}${b64_hash}"


def verify_password(password: str, stored_hash: str) -> bool:
    """Verify a password against a stored PBKDF2 hash.

    The stored hash must follow the format produced by
    :func:`hash_password`.  This function extracts the algorithm,
    iteration count and salt, rehashes the provided password with
    those parameters, and performs a constant‑time comparison.

    Parameters
    ----------
    password : str
        The plaintext password entered by the user.
    stored_hash : str
        The composite hash string previously produced by
        :func:`hash_password`.

    Returns
    -------
    bool
        ``True`` if the password matches the stored hash, ``False``
        otherwise.
    """
    if not stored_hash or stored_hash.count("$") != 3:
        return False
    algorithm, iteration_str, salt, b64_hash = stored_hash.split("$", 3)
    if algorithm != ALGORITHM:
        # Unsupported algorithm; in real deployments you might handle
        # migration here.
        return False
    try:
        iterations = int(iteration_str)
    except ValueError:
        return False
    # Recreate the hash with the stored parameters
    recomputed = hash_password(password, salt=salt, iterations=iterations)
    # Constant‑time comparison
    return secrets.compare_digest(stored_hash, recomputed)

