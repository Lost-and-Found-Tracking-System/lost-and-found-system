import sys
import json
import torch
import open_clip
from PIL import Image
import requests
from io import BytesIO
import os

def generate_embedding(text_content=None, image_url=None):
    try:
        # Load model and preprocess
        model_name = 'hf-hub:laion/CLIP-ViT-g-14-laion2B-s12B-b42K'
        device = "cuda" if torch.cuda.is_available() else "cpu"
        
        # Use a local cache directory to avoid re-downloading every time if possible
        # but for this script we'll just let open_clip handle it
        model, preprocess = open_clip.create_model_from_pretrained(model_name, device=device)
        tokenizer = open_clip.get_tokenizer(model_name)

        image_features = None
        text_features = None

        # Process image if provided
        if image_url:
            if image_url.startswith('http'):
                response = requests.get(image_url, stream=True)
                response.raise_for_status()
                image = Image.open(response.raw)
            else:
                image = Image.open(image_url)
            
            image_input = preprocess(image).unsqueeze(0).to(device)
            with torch.no_grad():
                image_features = model.encode_image(image_input)
                image_features /= image_features.norm(dim=-1, keepdim=True)

        # Process text if provided
        if text_content:
            text_input = tokenizer([text_content]).to(device)
            with torch.no_grad():
                text_features = model.encode_text(text_input)
                text_features /= text_features.norm(dim=-1, keepdim=True)

        # Hybrid embedding
        if image_features is not None and text_features is not None:
            # Simple average for hybrid embedding, or we could concatenate
            # The user said "hybrid and based on the title+description+category, as well as the image provided"
            # Normalized features can be added and re-normalized
            hybrid_features = (image_features + text_features) / 2
            hybrid_features /= hybrid_features.norm(dim=-1, keepdim=True)
            embedding = hybrid_features.squeeze(0).tolist()
        elif image_features is not None:
            embedding = image_features.squeeze(0).tolist()
        elif text_features is not None:
            embedding = text_features.squeeze(0).tolist()
        else:
            return {"error": "No input provided"}

        return {"embedding": embedding}

    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Missing input JSON"}))
        sys.exit(1)

    try:
        input_data = json.loads(sys.argv[1])
        text = input_data.get("text")
        image_url = input_data.get("image_url")
        
        result = generate_embedding(text_content=text, image_url=image_url)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
