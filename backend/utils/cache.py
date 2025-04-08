# Caching mechanism using Redis
import os
from dotenv import load_dotenv

load_dotenv()
# dotenv: Used to load environment variables from a .env file into the Python environment.

import redis
# redis: Python library to interact with a Redis server (in-memory key-value database).
import json
# json: Used to convert Python dictionaries to JSON strings and back — because Redis stores only strings or byte data.

#  You're connecting to a Redis server running on REDIS_HOST on port REDIS_PORT, using database 0. Redis allows multiple logical databases — here, db=0 refers to the first one.
redis_client = redis.Redis(host=os.getenv("REDIS_HOST"), port=os.getenv("REDIS_PORT"), db=0)

def get_cached_response(query: str):
    result = redis_client.get(query)
    return json.loads(result) if result else None

def set_cached_response(query: str, response: dict):
    redis_client.set(query, json.dumps(response), ex=3600)
