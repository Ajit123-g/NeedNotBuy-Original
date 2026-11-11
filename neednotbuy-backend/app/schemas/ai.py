from pydantic import BaseModel, Field
from typing import Optional


# ── Request ──────────────────────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    """Natural language requirement from the user."""
    query: str = Field(
        ...,
        min_length=3,
        description="User's natural language requirement"
    )


# ── Extracted Requirement ────────────────────────────────────────────────────

class RequirementResponse(BaseModel):
    """Structured requirement extracted by the AI."""
    item: str
    duration_days: int = 1
    purpose: Optional[str] = None
    urgency: Optional[str] = "normal"


# ── Recommendation Option ────────────────────────────────────────────────────

class OptionResponse(BaseModel):
    """A single scored alternative item."""
    item_id: str
    title: str
    type: str
    estimated_cost: float
    availability: bool
    score: float


# ── Full Recommendation Response ─────────────────────────────────────────────

class RecommendationResponse(BaseModel):
    """Complete recommendation result including the best option and alternatives."""
    requirement: RequirementResponse
    recommendation_type: Optional[str] = None
    recommended_item: Optional[OptionResponse] = None
    alternatives: list[OptionResponse] = Field(default_factory=list)
    reason: str
