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

GROQ_API_KEY="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"

def run_inference(message):
    if not GROQ_API_KEY:
        raise Exception("GROQ_API_KEY environment variable is missing")
        
    client = Groq(api_key=GROQ_API_KEY)
    
    # Use a standard Groq model that definitely exists
    # and remove 'reasoning_effort' which belongs to OpenAI o1 only.
    completion = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[{"role": "user", "content": message}],
        temperature=0.1,  # Low temperature for more consistent validation
        max_completion_tokens=8192,
        top_p=1,
        reasoning_effort="medium",
        stream=True,
        stop=None
    )
    
    overallResult = ""
    for chunk in completion:
        result = chunk.choices[0].delta.content
        if result is not None:
            overallResult += result

    return overallResult


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

        # Step 1
        itemDescription = getLostItemDescription(lostItem)

        # Step 2
        categoryDescription = getCategoryDescription(category)

        # Step 3
        commonDescription = getCommonDescription(
            lostItem,
            category,
            itemDescription,
            categoryDescription
        )

        # ❌ DO NOT early-exit on NULL (to match second file behavior)

        # Step 4: Similarity using SAME method as second file
        queryEmbedding = model.encode(categoryDescription)
        sentenceEmbedding = model.encode(commonDescription)
        similarity = model.similarity(queryEmbedding, sentenceEmbedding)
        similarity = similarity.item() * 100

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
        sys.exit(1)