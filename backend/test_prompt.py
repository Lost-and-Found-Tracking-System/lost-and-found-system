import os
from groq import Groq
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

prompt = '''
Lost Item: iPhone
Lost Item Description: A smartphone made by Apple.
category: Computing Device
Category Description: A computing device is an electronic machine that processes, stores, and communicates information. It can perform calculations, execute instructions, and store data, enabling users to perform various tasks such as browsing, gaming, and productivity work. Examples of computing devices include desktop computers, laptops, smartphones, tablets, and servers.

If the lost item clearly belongs to the category, output the EXACT FULL TEXT of the Category Description.
If it only partially matches, parse out ONLY the exact sentences of the Category Description that align with the item.
If it does not match at all, return the word NULL.
DO NOT ADD ANY OTHER CONTENT, PREAMBLE, OR FORMATTING OF YOUR OWN.
'''

completion = client.chat.completions.create(
    model="llama-3.1-8b-instant",
    messages=[{"role": "user", "content": prompt}],
    temperature=0.1
)
print(completion.choices[0].message.content)
