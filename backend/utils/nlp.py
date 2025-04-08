import spacy
import os
from dotenv import load_dotenv

load_dotenv()

SPACY=os.getenv("SPACY_MODEL")

nlp = spacy.load(SPACY)

def extract_entities(text: str):
    doc = nlp(text)
    return [(ent.text, ent.label_) for ent in doc.ents]
