from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field, HttpUrl, field_validator


class AirdropStatus(str, Enum):
    NEW = "NEW"
    ONGOING = "ONGOING"
    COMPLETED = "COMPLETED"
    CLAIMABLE = "CLAIMABLE"
    ENDED = "ENDED"


class TaskType(str, Enum):
    SOCIAL = "Social"
    WALLET = "Wallet"
    EARLY_ACCESS = "Early access"
    FAUCET = "Faucet"
    TESTNET = "Testnet"
    QUIZ = "Quiz"
    DISCORD = "Discord"


class ParticipationType(str, Enum):
    SOCIAL_TASKS = "Social tasks"
    WALLET_ACTIVITY = "Wallet activity"
    EARLY_ACCESS = "Early access"
    TESTNET = "Testnet"


class ProgressStatus(str, Enum):
    PENDING = "PENDING"
    DONE = "DONE"
    FAILED = "FAILED"


class UserBase(BaseModel):
    username: str = Field(min_length=3, max_length=64, pattern=r"^[A-Za-z0-9_.-]+$")


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=72)


class User(UserBase):
    id: int
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class ProfileBase(BaseModel):
    label: Optional[str] = Field(default=None, max_length=80)
    email: str = Field(min_length=3, max_length=254)
    wallet: str = Field(min_length=3, max_length=128)
    chrome_port: int = Field(ge=1, le=65535)
    chrome_profile: Optional[str] = None
    x_handle: Optional[str] = None
    discord_handle: Optional[str] = None
    ip_address: str = ""
    location: str = ""
    notes: Optional[str] = None

    @field_validator("wallet")
    @classmethod
    def reject_wallet_secrets(cls, value: str) -> str:
        candidate = value.strip()
        words = candidate.split()
        hex_value = candidate[2:] if candidate.startswith("0x") else candidate
        if len(words) >= 12 or (len(hex_value) == 64 and all(char in "0123456789abcdefABCDEF" for char in hex_value)):
            raise ValueError("Enter a public wallet address, never a private key or seed phrase")
        if any(char.isspace() for char in candidate):
            raise ValueError("Wallet addresses cannot contain whitespace")
        return candidate


class ProfileCreate(ProfileBase):
    pass


class Profile(ProfileBase):
    id: int
    user_id: int
    created_at: datetime


class TaskItem(BaseModel):
    task_name: str
    task_type: TaskType
    details: Optional[str] = None


class AirdropCreate(BaseModel):
    project_name: str
    website: HttpUrl
    reward_type: str
    reward_amount: Optional[str] = None
    deadline: datetime
    claim_link: Optional[HttpUrl] = None
    tasks: List[TaskItem] = Field(default_factory=list)

    @field_validator("tasks", mode="before")
    @classmethod
    def default_tasks(cls, value):
        return value or []


class AirdropResponse(BaseModel):
    id: int
    user_id: int
    project_name: str
    website: HttpUrl
    reward_type: str
    reward_amount: Optional[str] = None
    deadline: datetime
    status: AirdropStatus
    claim_link: Optional[HttpUrl]
    created_at: datetime
    tasks: List[TaskItem] = Field(default_factory=list)
    catalog_id: Optional[str] = None
    source: Optional[str] = None
    description: Optional[str] = None
    network: Optional[str] = None
    participation_types: List[ParticipationType] = Field(default_factory=list)


class DiscoveryAirdrop(BaseModel):
    id: str
    project_name: str
    website: HttpUrl
    source: str
    description: str
    network: str
    reward_type: str
    reward_amount: Optional[str] = None
    deadline: datetime
    score: int = Field(ge=0, le=100)
    participation_types: List[ParticipationType]
    tasks: List[TaskItem]
    discovered_at: datetime
    is_started: bool = False


class ProgressRecord(BaseModel):
    id: int
    profile_id: int
    task_id: int
    status: ProgressStatus
    screenshot_path: Optional[str] = None
    timestamp: datetime


class StepExecution(BaseModel):
    profile_id: int = Field(gt=0)
    airdrop_id: int = Field(gt=0)
    task_id: int = Field(gt=0)
    screenshot: str = Field(
        min_length=1,
        description="Base64-encoded PNG, JPEG, or WebP evidence; a matching data URL is also accepted.",
    )


class NotificationLog(BaseModel):
    id: int
    airdrop_id: int
    platform: str  # telegram, discord, x
    message: str
    timestamp: datetime
