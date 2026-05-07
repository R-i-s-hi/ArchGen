import axios from "axios";

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const generateArchitecture = async (systemPrompt, prompt, model) => {
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
    if (error.response?.status === 429 || error.response?.status === 404) {
      console.log(`Rate limit hit for ${model}, retrying after 2s...`);
      await sleep(2000);
      return null;
    }
    throw error;
  }
}

export const generateDiagram = async (arch, model) => {
  const systemPrompt = `Generate a flowchart TD showing the full system: frontend, backend, database, and their connections
                        
                        - Do NOT use parentheses inside subgraph labels
                        - Do NOT use parentheses () inside node labels — use square brackets [] instead
                        - Node labels must only contain alphanumeric characters, spaces, and hyphens`;

  const prompt = `Here is a software architecture: ${JSON.stringify(arch)}

                  Generate a Mermaid flowchart TD diagram showing the full system — frontend, backend, database, and their connections.

                  Return ONLY this JSON, nothing else:
                  {"diagram": "<raw mermaid code here with \\n for line breaks>"}`;

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