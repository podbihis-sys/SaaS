from __future__ import annotations

import secrets
import time
import uuid


def uuid7() -> uuid.UUID:
    """Approximation of UUIDv7: 48 bits ms timestamp + 74 bits randomness.

    Pure stdlib, no extra dependency.
    """
    ms = int(time.time() * 1000) & ((1 << 48) - 1)
    rand_a = secrets.randbits(12)
    rand_b = secrets.randbits(62)

    value = (ms & ((1 << 48) - 1)) << 80
    value |= (0x7 & 0xF) << 76
    value |= (rand_a & ((1 << 12) - 1)) << 64
    value |= (0b10 & 0b11) << 62
    value |= rand_b & ((1 << 62) - 1)

    return uuid.UUID(int=value)


def new_id() -> uuid.UUID:
    return uuid7()
