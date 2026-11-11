import json

from fastapi import APIRouter, HTTPException

from app.schemas.ai import (
    AnalyzeRequest,
    RequirementResponse,
    RecommendationResponse,
)
from app.services.ai_service import analyze_requirement
from app.services.recommendation_service import generate_recommendation


router = APIRouter(
    prefix="/api/ai",
    tags=["AI"]
)


@router.post(
    "/analyze",
    response_model=RequirementResponse
)
async def analyze(request: AnalyzeRequest):
    """Extract structured requirement from natural language query."""
    try:
        result = await analyze_requirement(request.query)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI analysis failed: {str(e)}"
        )


@router.post(
    "/recommend",
    response_model=RecommendationResponse
)
async def recommend(request: AnalyzeRequest):
    """Analyze requirement and return ranked item recommendations."""
    try:
        # Step 1: Extract structured requirement using Mistral AI
        requirement = await analyze_requirement(request.query)

        # Step 2: Search database and score alternatives
        result = generate_recommendation(requirement)

        # Step 3: Return combined response
        return {
            "requirement": requirement,
            **result
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Recommendation failed: {str(e)}"
        )
