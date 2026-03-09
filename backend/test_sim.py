import json
from sentence_transformers import SentenceTransformer

with open('/tmp/out.json') as f:
    data = json.load(f)

model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

q1 = model.encode(data['categoryDescription'])
q2 = model.encode(data['commonDescription'])
q3 = model.encode(data['itemDescription'])
q4 = model.encode("iPhone")

print("Cat vs Common:", model.similarity(q1, q2).item() * 100)
print("ItemDesc vs Common:", model.similarity(q3, q2).item() * 100)
print("ItemName vs Common:", model.similarity(q4, q2).item() * 100)
print("ItemDesc vs Cat:", model.similarity(q3, q1).item() * 100)
