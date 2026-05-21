from __future__ import annotations

import uuid
from dataclasses import dataclass
from pathlib import PurePosixPath

import httpx

from app.config import settings
from app.core.errors import ExternalServiceError
from app.logging_config import get_logger

logger = get_logger(__name__)


@dataclass(frozen=True, slots=True)
class UploadTarget:
    storage_path: str
    upload_url: str | None
    public_url: str | None


def _ext_from_filename(filename: str) -> str:
    p = PurePosixPath(filename)
    ext = p.suffix.lstrip(".").lower() or "jpg"
    return ext


class StorageService:
    def __init__(
        self,
        bucket: str | None = None,
        url: str | None = None,
        service_role_key: str | None = None,
    ) -> None:
        self.bucket = bucket or settings.SUPABASE_STORAGE_BUCKET
        self.url = url or settings.SUPABASE_URL
        self.service_role_key = service_role_key or settings.SUPABASE_SERVICE_ROLE_KEY

    def _enabled(self) -> bool:
        return bool(self.url and self.service_role_key)

    def make_object_path(self, company_id: uuid.UUID, inquiry_id: uuid.UUID, filename: str) -> str:
        ext = _ext_from_filename(filename)
        return f"{company_id}/{inquiry_id}/{uuid.uuid4()}.{ext}"

    async def create_signed_upload(
        self,
        company_id: uuid.UUID,
        inquiry_id: uuid.UUID,
        filename: str,
    ) -> UploadTarget:
        storage_path = self.make_object_path(company_id, inquiry_id, filename)
        if not self._enabled():
            return UploadTarget(
                storage_path=storage_path,
                upload_url=f"local://{self.bucket}/{storage_path}",
                public_url=None,
            )
        endpoint = (
            f"{self.url.rstrip('/')}/storage/v1/object/upload/sign/{self.bucket}/{storage_path}"
        )
        headers = {
            "Authorization": f"Bearer {self.service_role_key}",
            "Content-Type": "application/json",
        }
        async with httpx.AsyncClient(timeout=15.0) as client:
            res = await client.post(endpoint, headers=headers, json={})
        if res.status_code >= 400:
            logger.error("supabase_signed_upload_failed", status=res.status_code, body=res.text)
            raise ExternalServiceError(f"Supabase signed upload failed: {res.status_code}")
        body = res.json()
        upload_url = body.get("url") or body.get("signedURL") or body.get("signedUrl")
        if upload_url and not upload_url.startswith("http"):
            upload_url = f"{self.url.rstrip('/')}/storage/v1{upload_url}"
        return UploadTarget(storage_path=storage_path, upload_url=upload_url, public_url=None)

    async def create_signed_download(self, storage_path: str, expires_in: int = 3600) -> str:
        if not self._enabled():
            return f"local://{self.bucket}/{storage_path}"
        endpoint = (
            f"{self.url.rstrip('/')}/storage/v1/object/sign/{self.bucket}/{storage_path}"
        )
        headers = {
            "Authorization": f"Bearer {self.service_role_key}",
            "Content-Type": "application/json",
        }
        async with httpx.AsyncClient(timeout=15.0) as client:
            res = await client.post(endpoint, headers=headers, json={"expiresIn": expires_in})
        if res.status_code >= 400:
            logger.error("supabase_signed_download_failed", status=res.status_code, body=res.text)
            raise ExternalServiceError(f"Supabase signed download failed: {res.status_code}")
        body = res.json()
        signed = body.get("signedURL") or body.get("signedUrl")
        if not signed:
            raise ExternalServiceError("Supabase signed download response missing URL")
        if signed.startswith("/"):
            signed = f"{self.url.rstrip('/')}/storage/v1{signed}"
        return signed
