from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field, HttpUrl, validator


class AirdropStatus(str, Enum):
    NEW = "NEW"
    ONGOING = "ONGOING"
    COMPLETED = "COMPLETED"
    CLAIMABLE = "CLAIMABLE"
    ENDED = "ENDED"


class TaskType(str, Enum):
    SOCIAL = "Social"
    FAUCET = "Faucet"
    TESTNET = "Testnet"
    QUIZ = "Quiz"
    DISCORD = "Discord"


class ProgressStatus(str, Enum):
    PENDING = "PENDING"
    DONE = "DONE"
    FAILED = "FAILED"


class UserBase(BaseModel):
    username: str


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class ProfileBase(BaseModel):
    email: str
    wallet: str
    chrome_port: int
    chrome_profile: Optional[str] = None
    x_handle: Optional[str] = None
    discord_handle: Optional[str] = None
    ip_address: str = ""
    location: str = ""
    notes: Optional[str] = None


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
    tasks: Optional[List[TaskItem]] = []

    @validator("tasks", pre=True, always=True)
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
    tasks: List[TaskItem] = []


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
