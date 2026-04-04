---
title: "REST API Testing with Python and Pytest"
description: "Building a clean, maintainable API test suite using Pytest, requests, and schema validation."
pubDate: 2024-05-20
tags: ["python", "pytest", "api", "automation"]
category: "automation/api"
draft: false
---

API tests are the most valuable tests you can write — fast, reliable, and close to the actual business logic. Here's how I structure them in Python.

## Project structure

```
tests/
  api/
    conftest.py       # fixtures, base URL, auth
    test_users.py
    test_orders.py
  schemas/
    user.json         # JSON Schema files
  utils/
    assertions.py
```

## Base setup with conftest.py

```python
import pytest
import requests

@pytest.fixture(scope="session")
def base_url():
    return "https://api.example.com/v1"

@pytest.fixture(scope="session")
def auth_headers():
    return {"Authorization": f"Bearer {get_token()}"}

@pytest.fixture
def client(base_url, auth_headers):
    session = requests.Session()
    session.headers.update(auth_headers)
    session.base_url = base_url
    return session
```

## Writing a test

```python
def test_create_user(client):
    payload = {"name": "Jane Doe", "email": "jane@example.com"}
    response = client.post(f"{client.base_url}/users", json=payload)

    assert response.status_code == 201
    data = response.json()
    assert data["email"] == payload["email"]
    assert "id" in data
```

## Schema validation

Don't just check status codes. Validate the response shape using `jsonschema`:

```python
import jsonschema, json

def test_user_schema(client):
    response = client.get(f"{client.base_url}/users/1")
    schema = json.load(open("tests/schemas/user.json"))
    jsonschema.validate(instance=response.json(), schema=schema)
```

This catches contract breaks — when a field gets renamed or a type changes — before they hit consumers.

## Parametrize for edge cases

```python
@pytest.mark.parametrize("email", ["", "notanemail", "a@", "@b.com"])
def test_invalid_email_rejected(client, email):
    response = client.post("/users", json={"name": "Test", "email": email})
    assert response.status_code == 422
```

One test, four edge cases, no duplication.

## Running in CI

```yaml
- name: Run API tests
  run: pytest tests/api/ -v --tb=short --junitxml=results.xml
```

Parse the JUnit XML in your CI dashboard for test history and trend visibility.
