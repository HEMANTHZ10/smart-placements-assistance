import os
import chromadb

# Ensure the db/chroma_data directory exists
DB_PATH = "db/chroma_data"
os.makedirs(DB_PATH, exist_ok=True)  # ✅ Automatically creates db folder

chroma_client = chromadb.PersistentClient(DB_PATH)

placement_stats_collection = chroma_client.get_or_create_collection(name="PlacementStatsData")
company_stats_collection = chroma_client.get_or_create_collection(name="CompanyStatsData")
company_insights_collection = chroma_client.get_or_create_collection(name="CompanyInsightsData")