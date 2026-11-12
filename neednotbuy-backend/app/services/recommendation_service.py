import re

from app.database.supabase_client import supabase


# Words that describe the condition/type, not the product itself.
NOISE_WORDS = {"second", "hand", "used", "new", "rent", "borrow", "buy"}


def clean_item_name(name: str) -> str:
    """Remove condition words like 'second hand' so only the product name remains."""
    text = re.sub(r"[^a-z0-9\s_\-]", " ", (name or "").lower())
    words = re.split(r"[\s_\-]+", text.strip())
    return " ".join(w for w in words if w and w not in NOISE_WORDS)


def search_items(item_name: str):

    cleaned = clean_item_name(item_name)

    query = (
        supabase
        .table("items")
        .select("*")
        .eq("availability", True)
    )

    # If nothing is left after cleaning (user typed only "second hand"),
    # return all available items instead of nothing.
    if cleaned:
        query = query.or_(
            f"title.ilike.%{cleaned}%,category.ilike.%{cleaned}%"
        )

    response = query.execute()

    return response.data


def calculate_cost(
    item: dict,
    duration_days: int
) -> float:

    item_type = item["type"]

    price = float(item["price"] or 0)

    if item_type == "borrow":

        return 0

    elif item_type == "rent":

        return price * duration_days

    elif item_type == "second_hand":

        return price

    return 0


def calculate_duration_score(
    item_type: str,
    duration_days: int
) -> float:

    if duration_days <= 3:

        scores = {
            "borrow": 100,
            "rent": 90,
            "second_hand": 20
        }

    elif duration_days <= 14:

        scores = {
            "borrow": 90,
            "rent": 80,
            "second_hand": 50
        }

    else:

        scores = {
            "borrow": 70,
            "rent": 50,
            "second_hand": 90
        }

    return scores.get(item_type, 0)


def calculate_cost_score(
    cost: float,
    max_cost: float
) -> float:

    if max_cost <= 0:
        return 100

    score = 100 - (cost / max_cost) * 100

    return round(score, 2)


def calculate_suitability_score(
    item: dict,
    item_name: str
) -> float:

    title = (item.get("title") or "").lower()

    category = (item.get("category") or "").lower()

    search_term = clean_item_name(item_name)

    if search_term in title:
        return 100

    if search_term in category:
        return 100

    return 0


def calculate_availability_score(
    available: bool
) -> float:

    if available:
        return 100

    return 0


def calculate_final_score(
    cost_score: float,
    duration_score: float,
    availability_score: float,
    suitability_score: float
) -> float:

    final_score = (
        cost_score * 0.40
        + duration_score * 0.30
        + availability_score * 0.20
        + suitability_score * 0.10
    )

    return round(final_score, 2)


def apply_hard_rules(
    items: list,
    duration_days: int
):

    if duration_days <= 3:

        borrow_options = [
            item
            for item in items
            if item["type"] == "borrow"
        ]

        if borrow_options:
            return borrow_options[0]

    return None


def generate_recommendation(
    requirement
):

    # STEP 1: Search database

    items = search_items(requirement.item)

    # STEP 2: Filter available items

    available_items = [
        item
        for item in items
        if item.get("availability") is True
    ]

    # STEP 3: Handle no available items

    if not available_items:

        return {
            "recommendation_type": None,
            "recommended_item": None,
            "alternatives": [],
            "reason": (
                "No available items were found "
                "for your requirement."
            )
        }

    # STEP 4: Apply hard rules

    hard_rule_result = apply_hard_rules(
        available_items,
        requirement.duration_days
    )

    # STEP 5: Calculate maximum cost

    costs = [
        calculate_cost(
            item,
            requirement.duration_days
        )
        for item in available_items
    ]

    max_cost = max(costs, default=0)

    # STEP 6: Calculate scores

    scored_options = []

    for item in available_items:

        cost = calculate_cost(
            item,
            requirement.duration_days
        )

        cost_score = calculate_cost_score(
            cost,
            max_cost
        )

        duration_score = calculate_duration_score(
            item["type"],
            requirement.duration_days
        )

        availability_score = calculate_availability_score(
            item["availability"]
        )

        suitability_score = calculate_suitability_score(
            item,
            requirement.item
        )

        final_score = calculate_final_score(
            cost_score,
            duration_score,
            availability_score,
            suitability_score
        )

        scored_options.append({
            "item_id": str(item["id"]),
            "title": item["title"],
            "type": item["type"],
            "estimated_cost": cost,
            "availability": item["availability"],
            "score": final_score
        })

    # STEP 7: Sort options by score

    scored_options.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    # STEP 8: Choose recommendation

    if hard_rule_result:

        selected = next(
            option
            for option in scored_options
            if option["item_id"] == str(hard_rule_result["id"])
        )

    else:

        selected = scored_options[0]

    item_label = clean_item_name(requirement.item) or requirement.item

    return {
        "recommendation_type": selected["type"],
        "recommended_item": selected,
        "alternatives": scored_options,
        "reason": generate_explanation(
            item_label,
            requirement.duration_days,
            selected["type"],
            selected["estimated_cost"]
        )
    }


def generate_explanation(
    item_name: str,
    duration_days: int,
    recommendation_type: str,
    estimated_cost: float
) -> str:

    if recommendation_type == "borrow":

        return (
            f"You only need the {item_name} for "
            f"{duration_days} day(s). Borrowing is "
            f"the most cost-effective available option. "
            f"Estimated cost: ₹{estimated_cost}."
        )

    elif recommendation_type == "rent":

        return (
            f"Since you need the {item_name} for "
            f"{duration_days} day(s), renting is a "
            f"practical alternative to purchasing it. "
            f"Estimated cost: ₹{estimated_cost}."
        )

    elif recommendation_type == "second_hand":

        return (
            f"A second-hand {item_name} is available "
            f"and may be suitable for longer-term usage. "
            f"Purchase cost: ₹{estimated_cost}."
        )

    return (
        "This is the highest-scoring available option "
        "based on your requirement."
    )