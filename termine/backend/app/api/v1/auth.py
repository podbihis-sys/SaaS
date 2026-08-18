from __future__ import annotations

from fastapi import APIRouter, status
from sqlalchemy import select

from app.deps import CurrentUser, SessionDep
from app.models.base import utcnow
from app.models.enums import DevicePlatform
from app.models.user import Device, User
from app.schemas.common import Ack
from app.schemas.watch import AuthRequest, AuthResponse, DeviceOut, DeviceRegister
from app.security import issue_token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/device", response_model=AuthResponse)
async def authenticate_device(payload: AuthRequest, session: SessionDep) -> AuthResponse:
    """Exchange an install id for a token, creating the account on first sight.

    There is no sign-up step: watching for an appointment does not require
    knowing who is watching, and every field we do not collect is one we cannot
    leak.
    """
    user = (
        await session.execute(select(User).where(User.install_id == payload.install_id))
    ).scalar_one_or_none()

    if user is None:
        user = User(install_id=payload.install_id, locale=payload.locale)
        session.add(user)
        await session.flush()
    else:
        user.locale = payload.locale
        user.last_seen_at = utcnow()

    token, expires_at = issue_token(user.id)
    return AuthResponse(token=token, expires_at=expires_at, user_id=user.id)


@router.post("/devices", response_model=DeviceOut, status_code=status.HTTP_201_CREATED)
async def register_device(payload: DeviceRegister, user: CurrentUser, session: SessionDep) -> Device:
    """Register or refresh a push token.

    Tokens move between users when a phone is handed on or the app is
    reinstalled, so an existing token is reassigned rather than rejected.
    """
    platform = DevicePlatform(payload.platform)
    device = (
        await session.execute(select(Device).where(Device.push_token == payload.push_token))
    ).scalar_one_or_none()

    if device is None:
        device = Device(
            user_id=user.id,
            push_token=payload.push_token,
            platform=platform,
            locale=payload.locale,
            app_version=payload.app_version,
        )
        session.add(device)
    else:
        device.user_id = user.id
        device.platform = platform
        device.locale = payload.locale
        device.app_version = payload.app_version
        device.active = True
        device.invalidated_at = None

    await session.flush()
    return device


@router.delete("/devices/{push_token}", response_model=Ack)
async def unregister_device(push_token: str, user: CurrentUser, session: SessionDep) -> Ack:
    device = (
        await session.execute(
            select(Device).where(Device.push_token == push_token, Device.user_id == user.id)
        )
    ).scalar_one_or_none()
    if device is not None:
        device.active = False
        device.invalidated_at = utcnow()
    return Ack()
