import generateArchitecture from "../services/aiService.js";
import buildPrompt from "../utils/promptTemplate.js";
import Project from "../models/Project.model.js";


function extractJSON(text) {
  // Try code fence first
  const fenceMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/);
  if (fenceMatch) {
    try {
      JSON.parse(fenceMatch[1]);
      return fenceMatch[1];
    } catch { }
  }

  // Fallback: brace scanner
  let stack = 0, start = -1;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "{") { if (stack === 0) start = i; stack++; }
    else if (text[i] === "}") { stack--; if (stack === 0 && start !== -1) return text.slice(start, i + 1); }
  }

  return null;
}

export const generateProject = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: "Prompt is required"
      });
    }

    const systemPrompt = buildPrompt(prompt);

    const result = await generateArchitecture(systemPrompt);
    console.log("TYPE:", typeof result);
    console.log("RAW:", result);

    const cleanJSON = extractJSON(result);

    if (!cleanJSON) {
      console.log("AI raw output:", result);
      return res.status(500).json({
        error: "Could not extract JSON"
      });
    }

    let parsed;

    try {
      parsed = JSON.parse(cleanJSON);
      const newProject = await Project.create({
        prompt,
        tech_stack: parsed.tech_stack,
        folder_structure: parsed.folder_structure,
        database_schema: parsed.database_schema,
        api_routes: parsed.api_routes,
        feature_roadmap: parsed.feature_roadmap,
        explanation: parsed.explanation
      });
      return res.json({
        success: true,
        meta: {
          prompt,
          generatedAt: new Date()
        },
        data: newProject
      });
    } catch (err) {
      console.log("Invalid JSON after extraction:", cleanJSON);
      return res.status(500).json({
        error: "Invalid JSON after extraction"
      });
    }


  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "AI generation failed"
    });
  }
};