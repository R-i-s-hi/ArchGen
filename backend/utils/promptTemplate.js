export default function buildPrompt(userPrompt) {
  return `
You are a senior software architect.

Return ONLY valid JSON. No explanations or markdown.

Project:
${userPrompt}

Requirements:
- Provide practical, production-ready architecture
- Use feature-based folder structure (not generic folders)
- Folder structure must be deeply nested (3+ levels)
- Include realistic backend modules and frontend features
- Use ObjectId references in database_schema where applicable
- Add clear reasoning for architecture decisions in the "explanation" field defined below, at least 4 entries justifying major architecture decisions

Return this exact structure:

{
  "tech_stack": {
    "frontend": {
      "framework": "",
      "state_management": "",
      "styling": ""
    },
    "backend": {
      "framework": "",
      "runtime": "",
      "auth": ""
    },
    "database": {
      "type": "",
      "reason": ""
    }
  },
  "folder_structure": {
    "frontend": [],
    "backend": []
  },
  "database_schema": {},
  "api_routes": [
    {
      "path": "",
      "method": "",
      "description": ""
    }
  ],
  "feature_roadmap": [
    {
      "name": "",
      "description": "",
      "status": ""
    }
  ],
  "explanation": [
    {
      "title": "",
      "reason": ""
    }
  ]
}

CRITICAL: Output the JSON object above filled with real values. 
Do NOT include any text, markdown, or code fences before or after the JSON.
`;
}