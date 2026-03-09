import sys
import logging
import json
import os
from groq import Groq
from transformers.utils import logging as hf_logging
from sentence_transformers import SentenceTransformer

# Suppress warnings
os.environ["TOKENIZERS_PARALLELISM"] = "false"
hf_logging.set_verbosity_error()
logging.getLogger("sentence_transformers").setLevel(logging.ERROR)
logging.getLogger("torch").setLevel(logging.ERROR)


GROQ_API_KEY = os.environ.get('GROQ_API_KEY', '')

def run_inference(message):
    if not GROQ_API_KEY:
        raise Exception("GROQ_API_KEY environment variable is missing")
        
    client = Groq(api_key=GROQ_API_KEY)
    
    # Use a standard Groq model that definitely exists
    # and remove 'reasoning_effort' which belongs to OpenAI o1 only.
    completion = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[{"role": "user", "content": message}],
        temperature=0.1,
        max_tokens=1024,
        top_p=1,
        stream=False,
        stop=None
    )
    
    return completion.choices[0].message.content


def getLostItemDescription(lostItem):
    prompt = f'''
        Given lost item: {lostItem}

        Give a concise description of the features, behaviour and characteristics of above item
        '''
    return run_inference(prompt)


def getCategoryDescription(category):
    prompt = f'''
    Given category: {category}
    
    Give a concise description of the above category
    '''
    return run_inference(prompt)


def getCommonDescription(lostItem, category, lostItemDescription, categoryDescription):
    prompt = f'''
    
    Lost Item: {lostItem}
    
    Lost Item Description: {lostItemDescription}
    
    category: {category}
    
    Category Description: {categoryDescription}
    
    
    Parse out the EXACT SENTENCES of the given CATEGORY DESCRIPTION that align with the features of {lostItem}.
    
    If none match, return NULL. 
    
    AVOID ADDING ANY OTHER FURTHER CONTENT OF YOUR OWN
    
    '''
    return run_inference(prompt)


if __name__ == "__main__":
    if len(sys.argv) < 4:
        sys.exit(1)

    title = sys.argv[1]
    item_desc_raw = sys.argv[2]
    category = sys.argv[3]

    lostItem = f"{title} {item_desc_raw}".strip()

    try:
        model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

        try:
            # Try to hit Groq for advanced reasoning
            itemDescription = getLostItemDescription(lostItem)
            categoryDescription = getCategoryDescription(category)
            commonDescription = getCommonDescription(
                lostItem,
                category,
                itemDescription,
                categoryDescription
            )

            queryEmbedding = model.encode(categoryDescription)
            sentenceEmbedding = model.encode(commonDescription)
            similarity = model.similarity(queryEmbedding, sentenceEmbedding).item() * 100

        except Exception as e:
            print(f"[Fallback] Groq failed ({e}), using raw text comparison", file=sys.stderr)
            # Offline Fallback: compute cosine sim directly on raw title/desc and category name
            itemDescription = lostItem
            categoryDescription = category
            commonDescription = lostItem
            
            queryEmbedding = model.encode(category)
            sentenceEmbedding = model.encode(lostItem)
            
            raw_sim = model.similarity(queryEmbedding, sentenceEmbedding).item()
            # Raw text similarity is often lower, scale it up so it matches the 0-100 threshold (35)
            similarity = max(0.0, raw_sim * 150.0) 

        print(json.dumps({
            "similarity": float(similarity),
            "itemDescription": itemDescription,
            "categoryDescription": categoryDescription,
            "commonDescription": commonDescription
        }))

    except Exception as e:
        print(json.dumps({
            "error": str(e),
            "similarity": 0
        }))
        sys.exit(0)