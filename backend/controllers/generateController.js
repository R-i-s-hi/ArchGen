import { jsonrepair } from "jsonrepair";

import { generateArchitecture, generateDiagram } from "../services/aiService.js";
import { SYSTEM_PROMT } from "../utils/promptTemplate.js";
import Project from "../models/Project.model.js";



function extractJSON(text) {
  // Try code fence first
  const fenceMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/);
  if (fenceMatch) {
    return fenceMatch[1].trim();
  }

  // Fallback: brace scanner
  let stack = 0;
  let start = -1;

  for (let i = 0; i < text.length; i++) {
    if (text[i] === "{") {
      if (stack === 0) start = i;
      stack++;
    } else if (text[i] === "}") {
      stack--;
      if (stack === 0 && start !== -1) {
        let candidate = text.slice(start, i + 1).trim();
        // ✅ strip anything after the last closing brace
        candidate = candidate.replace(/}\s*$/, "}");
        return candidate;
      }
    }
  }

  return null;
}

export const generateProject = async (req, res) => {
  try {
    const { prompt, ownerId, ttl } = req.body;
    const models = [
      "google/gemma-4-31b-it:free",
      "meta-llama/llama-3.3-70b-instruct:free",
      "openai/gpt-oss-120b:free",
    ];

    if (!prompt || !ownerId) {
      return res.status(400).json({
        error: "Prompt or ownerId is missing.",
      });
    }

    const systemPrompt = SYSTEM_PROMT;
    let result = null;
    for (const model of models) {
      result = await generateArchitecture(systemPrompt, prompt, model);
      if (result) {
        console.log(`Success from ${model}`);
        break;
      }
    }

    if (!result) {
      return res.status(500).json({ error: "No model produced output" });
    }

    const cleanJSON = extractJSON(result);

    if (!cleanJSON) {
      return res.status(500).json({
        error: "Could not extract JSON",
      });
    }

    let parsed;

    try {
      const repaired = jsonrepair(cleanJSON);
      parsed = JSON.parse(repaired);

      const newProject = await Project.create({
        ownerId,
        prompt,
        tech_stack: parsed.tech_stack,
        folder_structure: parsed.folder_structure,
        database_schema: parsed.database_schema,
        api_routes: parsed.api_routes,
        feature_roadmap: parsed.feature_roadmap,
        explanation: parsed.explanation,
        ...(ttl ? { expireAt: new Date(Date.now() + ttl * 1000) } : {}),
      });

      let DiagramResult = null;
      for (const model of models) {
        DiagramResult = await generateDiagram(parsed, model);
        if (DiagramResult) {
          console.log(`Success from ${model}`);
          break;
        }
      }

      if (!DiagramResult) {
        return res.status(500).json({ error: "No model produced output" });
      }
      console.log(DiagramResult);

      const cleanDiagramJSON = extractJSON(DiagramResult);
      if (!cleanDiagramJSON) {
        return res.status(500).json({
          error: "Could not extract JSON",
        });
      }

      const repairedDiagram = jsonrepair(cleanDiagramJSON );
      const parsedDiagram = JSON.parse(repairedDiagram);

      const updatedProject = await Project.findByIdAndUpdate({_id: newProject._id}, {diagram: parsedDiagram.diagram},  { new: true });

      return res.json({
        success: true,
        meta: {
          prompt,
          generatedAt: new Date(),
        },
        data: updatedProject,
      });
    } catch (err) {
      console.log("JSON handling failed:", err.message);

      return res.status(500).json({
        error: "Invalid AI JSON",
      });
    }
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "AI generation failed",
    });
  }
};
