from app.services.recommendation_service import search_items


def test_search_items():

    items = search_items("projector")

    print(items)

    assert isinstance(items, list)