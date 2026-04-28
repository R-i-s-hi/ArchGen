import axios from "axios";

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default async function generateArchitecture(systemPrompt, prompt, model) {
  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.2
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data.choices[0].message.content;

  } catch (error) {
    if (error.response?.status === 429) {
      console.log(`Rate limit hit for ${model}, retrying after 2s...`);
      await sleep(2000);
      return null;
    }
    throw error;
  }
}