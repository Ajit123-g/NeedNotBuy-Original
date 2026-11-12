import json
import logging

from fastapi import APIRouter, HTTPException

from app.database.supabase_client import supabase
from app.schemas.ai import (
    AnalyzeRequest,
    RequirementResponse,
    RecommendationResponse,
)
from app.services.ai_service import analyze_requirement
from app.services.recommendation_service import generate_recommendation


logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/ai",
    tags=["AI"]
)


def save_recommendation(
    user_id,
    query: str,
    requirement,
    result: dict
):
    """
    Save the recommendation in the ai_recommendations table.
    Never breaks the search: if saving fails, the error is only logged.
    """
    if not user_id:
        logger.warning("ai_recommendations not saved: user_id missing")
        return

    try:
        # Works with both pydantic v2 (model_dump) and v1 (dict)
        if hasattr(requirement, "model_dump"):
            requirement_data = requirement.model_dump()
        else:
            requirement_data = requirement.dict()

        recommended = result.get("recommended_item")

        if recommended:
            recommendation_text = (
                f"{result.get('recommendation_type')}: "
                f"{recommended.get('title')}"
            )
        else:
            recommendation_text = "No items found"

        supabase.table("ai_recommendations").insert({
            "user_id": str(user_id),
            "query": query,
            "extracted_requirement": json.loads(
                json.dumps(requirement_data, default=str)
            ),
            "recommendation": recommendation_text,
            "reason": result.get("reason"),
        }).execute()

    except Exception as e:
        # Check your backend terminal for this message
        print(f"ERROR saving ai_recommendations: {e}")
        logger.error("Failed to save ai_recommendations: %s", e)


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

        # Step 3: Save the recommendation for this user
        save_recommendation(
            user_id=getattr(request, "user_id", None),
            query=request.query,
            requirement=requirement,
            result=result,
        )

        # Step 4: Return combined response
        return {
            "requirement": requirement,
            **result
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Recommendation failed: {str(e)}"
        )
