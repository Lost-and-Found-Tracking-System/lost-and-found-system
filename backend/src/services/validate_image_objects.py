import sys
import json
import os
import logging
from groq import Groq
from transformers.utils import logging as hf_logging
from sentence_transformers import SentenceTransformer

# Suppress noisy warnings
os.environ["TOKENIZERS_PARALLELISM"] = "false"
hf_logging.set_verbosity_error()
logging.getLogger("sentence_transformers").setLevel(logging.ERROR)
logging.getLogger("torch").setLevel(logging.ERROR)

import os
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), '../../.env')
load_dotenv(env_path, override=True)

GROQ_API_KEY = os.environ.get('GROQ_API_KEY', '')

def run_inference(message):
    if not GROQ_API_KEY:
        raise Exception("GROQ_API_KEY environment variable is missing")
        
    client = Groq(api_key=GROQ_API_KEY)
    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": message}],
        temperature=0.1,
        max_tokens=1024,
        stream=False
    )
    return completion.choices[0].message.content

def getLostItemDescription(lostItem):
    prompt = f"Given lost item: {lostItem}\nGive a concise description of the features, behaviour and characteristics of above item"
    return run_inference(prompt)

def getCategoryDescription(category):
    prompt = f"Given category: {category}\nGive a concise description of the above category"
    return run_inference(prompt)

def getCommonDescription(lostItem, category, lostItemDescription, categoryDescription):
    prompt = f'''
    Lost Item: {lostItem}
    Lost Item Description: {lostItemDescription}
    Category: {category}
    
    Evaluate if the {lostItem} matches the given {category}. 
    - If it is a clear match, output the EXACT FULL TEXT of the Category Description below verbatim.
    - If it only partially matches, parse out ONLY the exact sentences of the Category Description that align with the item.
    - If it does not match at all, return the word NULL.

    Category Description to output if match:
    {categoryDescription}

    AVOID ADDING ANY OTHER CONTENT, PREAMBLE, OR FORMATTING OF YOUR OWN.
    '''
    return run_inference(prompt)

def compute_label_similarity(model, item_text, item_desc, label):
    """Exact logic of ai_category_validator.py for a single label."""
    try:
        # Step 2: Description for the label (treated as category)
        label_desc = getCategoryDescription(label)

        # Step 3: Common description
        common_desc = getCommonDescription(item_text, label, item_desc, label_desc)

        # Step 4: Similarity
        queryEmbedding = model.encode(label_desc)
        sentenceEmbedding = model.encode(common_desc)
        similarity = model.similarity(queryEmbedding, sentenceEmbedding).item() * 100
        return similarity
    except Exception as e:
        print(f"Error computing similarity for {label}: {e}", file=sys.stderr)
        return 0

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print(json.dumps({"error": "Usage: validate_image_objects.py <title> <description> <json_labels>"}))
        sys.exit(1)

    title = sys.argv[1]
    description = sys.argv[2]
    labels_json = sys.argv[3]

    try:
        labels = json.loads(labels_json)
        if not isinstance(labels, list):
            raise ValueError("labels must be a JSON array")
    except Exception as e:
        print(json.dumps({"error": f"Invalid labels JSON: {e}"}))
        sys.exit(1)

    item_text = f"{title} {description}".strip()

    try:
        model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        item_desc = getLostItemDescription(item_text)

        results = []
        for label in labels:
            similarity = compute_label_similarity(model, item_text, item_desc, label)
            results.append({"label": label, "similarity": round(similarity, 2)})

        print(json.dumps({"results": results}))
    except Exception as e:
        print(json.dumps({"error": str(e), "results": []}))
        sys.exit(0)
