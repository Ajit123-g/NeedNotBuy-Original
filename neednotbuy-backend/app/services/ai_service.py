import json
import re

from mistralai.client import Mistral

from app.core.config import settings
from app.schemas.ai import RequirementResponse


# Initialise Mistral client once at module load
client = Mistral(api_key=settings.MISTRAL_API_KEY)


# Words that describe condition/type, not the product itself
NOISE_WORDS = {"second", "hand", "used", "new", "rent", "borrow", "buy"}


def _strip_noise(item: str) -> str:
    """Remove words like 'second hand' so only the product name remains."""
    words = re.split(r"[\s_\-]+", (item or "").lower().strip())
    cleaned = " ".join(w for w in words if w and w not in NOISE_WORDS)
    return cleaned or (item or "").strip()


# ── Local fallback parser (used when Mistral is rate-limited) ────────────────

def _parse_duration(text: str) -> int:
    """Extract number of days from natural language."""
    text = text.lower()

    # "X days / weeks / months"
    match = re.search(r'(\d+)\s*(day|days)', text)
    if match:
        return int(match.group(1))

    match = re.search(r'(\d+)\s*(week|weeks)', text)
    if match:
        return int(match.group(1)) * 7

    match = re.search(r'(\d+)\s*(month|months)', text)
    if match:
        return int(match.group(1)) * 30

    # Written numbers
    written = {
        "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
        "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
        "a day": 1, "a week": 7, "a month": 30,
        "half a day": 1,
    }
    for word, days in written.items():
        if word in text:
            return days

    return 1  # default


def _parse_urgency(text: str) -> str:
    text = text.lower()
    if any(w in text for w in ["urgent", "immediately", "today", "asap", "emergency"]):
        return "high"
    if any(w in text for w in ["sometime", "eventually", "whenever", "flexible"]):
        return "low"
    return "normal"


def _extract_item(text: str) -> str:
    """Very lightweight item extractor using regex heuristics."""
    text_lower = text.lower()

    # Remove common filler words to isolate the item
    patterns = [
        r'i need (?:a |an |the )?(.+?)(?:\s+for\b|\s+to\b|$)',
        r'need (?:a |an |the )?(.+?)(?:\s+for\b|\s+to\b|$)',
        r'looking for (?:a |an |the )?(.+?)(?:\s+for\b|\s+to\b|$)',
        r'want (?:a |an |the )?(.+?)(?:\s+for\b|\s+to\b|$)',
        r'borrow (?:a |an |the )?(.+?)(?:\s+for\b|\s+to\b|$)',
        r'rent (?:a |an |the )?(.+?)(?:\s+for\b|\s+to\b|$)',
    ]

    for pattern in patterns:
        match = re.search(pattern, text_lower)
        if match:
            item = match.group(1).strip()
            # Remove trailing noise like "for 2 days"
            item = re.sub(r'\s*(for\s.*|to\s.*)$', '', item).strip()
            if item:
                return _strip_noise(item)

    # Last resort: return first noun-like word after "a/an/the"
    match = re.search(r'\b(?:a|an|the)\s+(\w+)', text_lower)
    if match:
        return _strip_noise(match.group(1))

    return _strip_noise(text.split()[0]) if text.strip() else "item"


def _parse_purpose(text: str) -> str | None:
    text_lower = text.lower()
    patterns = [
        r'for (?:a |an |the )?(.+?)(?:\s*\.|$)',
        r'to (?:use at|use for|use in) (.+?)(?:\s*\.|$)',
    ]
    for pattern in patterns:
        match = re.search(pattern, text_lower)
        if match:
            purpose = match.group(1).strip()
            # Skip if it's just a duration phrase
            if not re.match(r'^\d+\s*(day|week|month)', purpose):
                return purpose
    return None


def _local_fallback(query: str) -> RequirementResponse:
    """Parse the query locally without calling Mistral."""
    return RequirementResponse(
        item=_extract_item(query),
        duration_days=_parse_duration(query),
        purpose=_parse_purpose(query),
        urgency=_parse_urgency(query),
    )


# ── Main function ────────────────────────────────────────────────────────────

async def analyze_requirement(query: str) -> RequirementResponse:
    """
    Use Mistral AI (mistral-small-2603) to extract a structured requirement
    from the user's natural language description.

    Falls back to local NLP parsing if the API is rate-limited or unavailable,
    so the demo always works.
    """

    prompt = f"""You are a requirement extraction system.

Extract the user's requirement from their message.

Return ONLY valid JSON in exactly this format (no markdown, no extra text):

{{
    "item": "string",
    "duration_days": number,
    "purpose": "string or null",
    "urgency": "low, normal, or high"
}}

Rules:
- Extract only information supported by the user's message.
- Do not recommend an option.
- Do not invent prices or availability.
- "item" must be ONLY the product name (for example: "projector", "drill machine", "camera").
- Never put words like "second hand", "second", "used", "new", "rent", "borrow" or "buy" in "item".
- If duration is not mentioned, use 1.
- If purpose is not mentioned, use null.
- urgency must be one of: low, normal, high.
- Return only valid JSON without markdown code fences.

User message:
{query}
"""

    try:
        response = await client.chat.complete_async(
            model="mistral-small-2603",
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
        )

        response_text = response.choices[0].message.content.strip()

        # Strip markdown code fences if returned despite instructions
        if response_text.startswith("```"):
            lines = response_text.splitlines()
            lines = [l for l in lines if not l.startswith("```")]
            response_text = "\n".join(lines).strip()

        data = json.loads(response_text)

        # Safety net: clean the item even if the AI ignored the rule
        data["item"] = _strip_noise(data.get("item", ""))

        return RequirementResponse(**data)

    except Exception:
        # Graceful fallback: local rule-based parser
        # Covers rate limits, network errors, JSON parse errors
        return _local_fallback(query)
