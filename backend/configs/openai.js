import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

const response = await openai.chat.completions.create({
    model: "gemini-2.5-flash",
    messages: [{role: "user", content: "Explain to me how AI works",}],
    extra_body: {
      "google": {
        "thinking_config": {
          "thinking_budget": 800,
          "include_thoughts": true
        }
      }
    }
});

console.log(response.choices[0].message);
