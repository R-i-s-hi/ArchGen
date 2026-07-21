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
  const systemPrompt = `You are a Mermaid.js diagram generator.

  Generate a flowchart (graph TD) showing the full system: frontend, backend, database, and their connections.

  STRICT SYNTAX RULES:
  - Node labels: only alphanumeric characters, spaces, and hyphens. No parentheses, colons, slashes, or quotes inside labels.
  - Subgraph titles: only alphanumeric characters, spaces, and hyphens. No parentheses inside subgraph titles.
  - Allowed node shapes (use exactly these, matching brackets required):
    - Rectangle: NodeId[Label]
    - Rounded: NodeId(Label)
    - Cylinder for databases only: NodeId[(Label)] — must open with [( and close with )], never just ]
    - Rhombus: NodeId{Label}
  - Every subgraph must follow: subgraph Id [Title] ... end
  - Every opened bracket must have its exact matching close: [ with ], ( with ), [( with )], { with }
  - Do not put quotes around labels
  - Keep labels short: 2-4 words maximum
  - Use only -- or --> or -.-> for connections, with edge labels in the form: A -- Label --> B
  - Return raw Mermaid syntax only — no markdown fences, no explanations`;

  const prompt = `Here is a software architecture: ${JSON.stringify(arch)}

  Generate a Mermaid flowchart TD diagram showing the full system — frontend, backend, database, and their connections. Use a cylinder shape [(Label)] for database nodes specifically.

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