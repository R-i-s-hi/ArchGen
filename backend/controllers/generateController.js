import { jsonrepair } from "jsonrepair";

import generateArchitecture from "../services/aiService.js";
import buildPrompt from "../utils/promptTemplate.js";
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

    if (!prompt) {
      return res.status(400).json({
        error: "Prompt is required",
      });
    }

    if (!ownerId) {
      return res.status(400).json({
        error: "owner is required",
      });
    }

    const systemPrompt = buildPrompt();
    const models = [
      "google/gemma-3-27b-it:free",
      "google/gemma-3-12b-it:free",
      "meta-llama/llama-3.3-70b-instruct:free",
      "openai/gpt-oss-120b:free",
    ];

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

      return res.json({
        success: true,
        meta: {
          prompt,
          generatedAt: new Date(),
        },
        data: newProject,
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
