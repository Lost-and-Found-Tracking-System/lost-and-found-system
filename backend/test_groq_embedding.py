import os, json
from groq import Groq
client = Groq(api_key=os.environ.get('GROQ_API_KEY'))
try:
    resp = client.models.list()
    for m in resp.data:
        print(m.id)
except Exception as e:
    print(e)
