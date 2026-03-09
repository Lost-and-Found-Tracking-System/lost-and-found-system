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

import os
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), '../../.env')
load_dotenv(env_path, override=True)

GROQ_API_KEY = os.environ.get('GROQ_API_KEY', '')

def run_inference(message):
    if not GROQ_API_KEY:
        raise Exception("GROQ_API_KEY environment variable is missing")
        
    client = Groq(api_key=GROQ_API_KEY)
    
    # Use a standard Groq model that definitely exists
    # and remove 'reasoning_effort' which belongs to OpenAI o1 only.
    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
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


if __name__ == "__main__":
    if len(sys.argv) < 4:
        sys.exit(1)

    title = sys.argv[1]
    item_desc_raw = sys.argv[2]
    category = sys.argv[3]

    lostItem = f"{title} {item_desc_raw}".strip()

    try:
        model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

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