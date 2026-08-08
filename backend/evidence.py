import base64
import binascii
import logging
from pathlib import Path
from typing import Dict, Iterable, Tuple
from uuid import uuid4

from . import database
from .config import MAX_SCREENSHOT_BYTES, SCREENSHOT_BASE


logger = logging.getLogger(__name__)

_IMAGE_SIGNATURES: Tuple[Tuple[str, bytes], ...] = (
    ("png", b"\x89PNG\r\n\x1a\n"),
    ("jpg", b"\xff\xd8\xff"),
)
_MIME_EXTENSIONS = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
}


class EvidenceValidationError(ValueError):
    def __init__(self, detail: str, status_code: int = 422) -> None:
        super().__init__(detail)
        self.detail = detail
        self.status_code = status_code


def decode_screenshot(value: str) -> Tuple[bytes, str]:
    payload = value.strip()
    declared_extension = None
    if payload.startswith("data:"):
        header, separator, payload = payload.partition(",")
        if not separator or ";base64" not in header.lower():
            raise EvidenceValidationError("Screenshot data URL must contain base64 data")
        media_type = header[5:].split(";", 1)[0].lower()
        declared_extension = _MIME_EXTENSIONS.get(media_type)
        if declared_extension is None:
            raise EvidenceValidationError("Screenshot data URL must declare PNG, JPEG, or WebP", 415)

    max_encoded_length = ((MAX_SCREENSHOT_BYTES + 2) // 3) * 4
    if len(payload) > max_encoded_length:
        raise EvidenceValidationError(_size_limit_message(), 413)

    try:
        image = base64.b64decode(payload, validate=True)
    except (binascii.Error, ValueError):
        raise EvidenceValidationError("Screenshot must be valid base64") from None

    if len(image) > MAX_SCREENSHOT_BYTES:
        raise EvidenceValidationError(_size_limit_message(), 413)
    if not image:
        raise EvidenceValidationError("Screenshot must not be empty")

    extension = _detect_image_extension(image)
    if extension is None:
        raise EvidenceValidationError("Screenshot must be a PNG, JPEG, or WebP image", 415)
    if declared_extension is not None and declared_extension != extension:
        raise EvidenceValidationError("Screenshot data URL type does not match the image content", 415)
    return image, extension


def _size_limit_message() -> str:
    limit_mib = MAX_SCREENSHOT_BYTES / (1024 * 1024)
    return f"Screenshot exceeds the {limit_mib:g} MiB limit"


def _detect_image_extension(image: bytes) -> str | None:
    for extension, signature in _IMAGE_SIGNATURES:
        if image.startswith(signature):
            return extension
    if len(image) >= 12 and image.startswith(b"RIFF") and image[8:12] == b"WEBP":
        return "webp"
    return None


def save_screenshot(image: bytes, extension: str, airdrop_id: int, profile_id: int) -> Path:
    screenshot_dir = SCREENSHOT_BASE / str(airdrop_id) / str(profile_id)
    screenshot_dir.mkdir(parents=True, exist_ok=True)
    screenshot_path = screenshot_dir / f"{uuid4().hex}.{extension}"
    with screenshot_path.open("xb") as screenshot_file:
        screenshot_file.write(image)
    return screenshot_path


def discard_screenshot(path: str | Path) -> bool:
    screenshot_root = SCREENSHOT_BASE.resolve()
    screenshot_path = Path(path).resolve()
    if not screenshot_path.is_relative_to(screenshot_root):
        logger.warning("Refusing to delete evidence outside screenshot storage: %s", screenshot_path)
        return True

    try:
        screenshot_path.unlink(missing_ok=True)
    except OSError:
        logger.exception("Unable to delete expired evidence: %s", screenshot_path)
        return False

    parent = screenshot_path.parent
    while parent != screenshot_root and parent.is_relative_to(screenshot_root):
        try:
            parent.rmdir()
        except OSError:
            break
        parent = parent.parent
    return True


def cleanup_expired_progress(hours: int) -> int:
    expired_records: Iterable[Dict[str, object]] = database.get_expired_progress_records(hours)
    removable_ids = []
    for record in expired_records:
        screenshot_path = record.get("screenshot_path")
        if not screenshot_path or discard_screenshot(str(screenshot_path)):
            removable_ids.append(int(record["id"]))
    return database.delete_progress_records(removable_ids) if removable_ids else 0