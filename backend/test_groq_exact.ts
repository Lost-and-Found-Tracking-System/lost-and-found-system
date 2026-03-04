import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'\;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = 'openai/gpt-oss-20b';

async function run_inference(message: string) {
    console.log("Hitting Groq with model:", GROQ_MODEL);
    const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [{ role: 'user', content: message }],
            temperature: 1,
            max_completion_tokens: 8192,
            top_p: 1,
            reasoning_effort: 'high'
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        console.error("GROQ ERROR:", response.status, err);
        return null;
    }

    const data: any = await response.json();
    return data.choices?.[0]?.message?.content;
}

async function test() {
    const res = await run_inference("Give a concise description of an Iphone-16");
    console.log("RESULT:", res);
}

test();
