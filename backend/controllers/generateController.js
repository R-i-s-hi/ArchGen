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
        candidate = candidate.replace(/}\s*$/, "}");
        return candidate;
      }
    }
  }

  return null;
}

function extractMermaidFence(text) {
  // Try ```mermaid ... ``` fence specifically
  const mermaidFence = text.match(/```mermaid\n?([\s\S]*?)```/);
  if (mermaidFence) {
    return mermaidFence[1].trim();
  }

  // Try any generic fence that isn't explicitly json
  const genericFence = text.match(/```(?:\w*)\n?([\s\S]*?)```/);
  if (genericFence && !/^json/i.test(genericFence[0])) {
    return genericFence[1].trim();
  }

  return null;
}

function looksLikeMermaid(text) {
  return /^\s*(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|journey|pie)\b/i.test(
    text
  );
}

function sanitizeRawText(text) {
  return text
    .replace(/```mermaid/g, "")
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .replace(/\r/g, "")
    .trim();
}

function extractDiagramText(raw) {
  if (!raw || typeof raw !== "string") return "";

  const text = raw.trim();

  // Strategy 1: JSON-wrapped, e.g. {"diagram": "graph TD..."} (fenced or not)
  const jsonCandidate = extractJSON(text);
  if (jsonCandidate) {
    try {
      const repaired = jsonrepair(jsonCandidate);
      const parsed = JSON.parse(repaired);
      if (parsed && typeof parsed.diagram === "string" && parsed.diagram.trim()) {
        return parsed.diagram.trim();
      }
    } catch {
      // not valid JSON, fall through
    }
  }

  // Strategy 2: fenced mermaid block, e.g. ```mermaid ... ```
  const fenced = extractMermaidFence(text);
  if (fenced && looksLikeMermaid(fenced)) {
    return fenced;
  }

  // Strategy 3: raw text that already looks like mermaid syntax
  const stripped = sanitizeRawText(text);
  if (looksLikeMermaid(stripped)) {
    return stripped;
  }

  // Strategy 4: last resort — return sanitized text anyway
  // (better than nothing, but log it so you can spot bad outputs)
  console.warn("Diagram output didn't match known patterns:", stripped.slice(0, 200));
  return stripped;
}

export const generateProject = async (req, res) => {
  try {
    const { prompt, ownerId, ttl } = req.body;
    const models = [
      "google/gemma-4-26b-a4b-it:free",
      "google/gemma-4-31b-it:free",
      "meta-llama/llama-3.3-70b-instruct:free",
      "openai/gpt-oss-20b:free",
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
        project_estimation: parsed.project_estimation,
        explanation: parsed.explanation,
        title: prompt,
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

      const diagramText = extractDiagramText(DiagramResult);

      if (!diagramText) {
        return res.status(500).json({
          error: "Could not extract diagram",
        });
      }

      const updatedProject = await Project.findByIdAndUpdate(
        {_id: newProject._id},
        { diagram: diagramText },
        { returnDocument: "after" }
      );


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
