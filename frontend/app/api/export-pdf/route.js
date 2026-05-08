import puppeteer from "puppeteer";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { architecture } = await req.json();

  if (!architecture) {
    return NextResponse.json({ error: "Invalid architecture" }, { status: 400 });
  }

  const html = buildArchitectureHTML(architecture);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  await page.waitForSelector(".mermaid svg");
  await new Promise(resolve => setTimeout(resolve, 500));

  const pdf = await page.pdf({
    format: "A4",
    margin: { top: "32px", bottom: "32px", left: "40px", right: "40px" },
    printBackground: true,
  });

  await browser.close();

  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="architecture-${Date.now()}.pdf"`,
    },
  });
}

function buildArchitectureHTML(a) {

  // Diagram
  const diagram = `
    <div class="section">
      <h2>Architecture Diagram</h2>

      <div class="diagram-container">
        <div class="mermaid">
          ${a.diagram}
        </div>
      </div>
    </div>
  `;

   // Explanation
  const explanation = `
    <div class="section">
      <h2>Project Architecture</h2>
      ${a.explanation.map((e) => `
        <div class="card" style="margin-bottom:12px">
          <div class="card-title">${e.title}</div>
          <p style="color:#555;line-height:1.6">${e.reason}</p>
        </div>`).join("")}
    </div>`;

  // Tech Stack
  const techStack = `
    <div class="section">
      <h2>Tech Stack</h2>
      <div class="grid-3">
        <div class="card">
          <div class="card-title">Frontend</div>
          <div class="kv"><span>Framework</span><span>${a.tech_stack.frontend.framework}</span></div>
          <div class="kv"><span>State</span><span>${a.tech_stack.frontend.state_management}</span></div>
          <div class="kv"><span>Styling</span><span>${a.tech_stack.frontend.styling}</span></div>
        </div>
        <div class="card">
          <div class="card-title">Backend</div>
          <div class="kv"><span>Framework</span><span>${a.tech_stack.backend.framework}</span></div>
          <div class="kv"><span>Runtime</span><span>${a.tech_stack.backend.runtime}</span></div>
          <div class="kv"><span>Auth</span><span>${a.tech_stack.backend.auth}</span></div>
        </div>
        <div class="card">
          <div class="card-title">Database</div>
          <div class="kv"><span>Type</span><span>${a.tech_stack.database.type}</span></div>
          <p class="reason">${a.tech_stack.database.reason}</p>
        </div>
      </div>
    </div>`;

  // Folder Structure
  const folderStructure = `
    <div class="section">
      <h2>Folder Structure</h2>
      <div class="grid-2">
        <div class="card">
          <div class="card-title">Frontend</div>
          <ul class="file-list">
            ${a.folder_structure.frontend.map((f) => `<li>${f}</li>`).join("")}
          </ul>
        </div>
        <div class="card">
          <div class="card-title">Backend</div>
          <ul class="file-list">
            ${a.folder_structure.backend.map((f) => `<li>${f}</li>`).join("")}
          </ul>
        </div>
      </div>
    </div>`;

  // API Routes
  const methodColors = { GET: "#22c55e", POST: "#3b82f6", PUT: "#f59e0b", DELETE: "#ef4444", PATCH: "#a855f7" };
  const apiRoutes = `
    <div class="section">
      <h2>API Routes</h2>
      <table>
        <thead><tr><th>Method</th><th>Path</th><th>Description</th></tr></thead>
        <tbody>
          ${a.api_routes.map((r) => `
            <tr>
              <td><span class="badge" style="background:${methodColors[r.method] ?? "#888"}">${r.method}</span></td>
              <td class="mono">${r.path}</td>
              <td>${r.description}</td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>`;

  // Database Schema
  const schemaCards = Object.entries(a.database_schema).map(([collection, fields]) => `
    <div class="card">
      <div class="card-title">${collection}</div>
      ${Object.entries(fields).map(([key, val]) =>
    `<div class="kv"><span>${key}</span><span class="mono">${Array.isArray(val) ? "Array" : val}</span></div>`
  ).join("")}
    </div>`).join("");

  const dbSchema = `
    <div class="section">
      <h2>Database Schema</h2>
      <div class="grid-2">${schemaCards}</div>
    </div>`;

  // Feature Roadmap
  const statusColors = { "In Progress": "#f59e0b", Planned: "#3b82f6", Backlog: "#9ca3af", Done: "#22c55e" };
  const roadmap = `
    <div class="section">
      <h2>Feature Roadmap</h2>
      ${a.feature_roadmap.map((f) => `
        <div class="roadmap-item">
          <div class="roadmap-header">
            <strong>${f.name}</strong>
            <span class="badge">Planned</span>
          </div>
          <p>${f.description}</p>
        </div>`).join("")}
    </div>`;


  return `
    <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
               background: #fff; color: #111; padding: 32px; font-size: 13px; }

        /* Header */
        .header { margin-bottom: 32px; padding-bottom: 16px; border-bottom: 2px solid #111; }
        .header h1 { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
        .header .prompt { color: #555; font-style: italic; font-size: 13px; }
        .header .meta { font-size: 11px; color: #999; margin-top: 6px; }

        /* Sections */
        .section { margin-bottom: 36px; }
        .section h2 { font-size: 16px; font-weight: 700; margin-bottom: 14px;
                      padding-bottom: 6px; border-bottom: 1px solid #e5e7eb; color: #111; }

        /* Cards & Grids */
        .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; }
        .card-title { font-weight: 700; font-size: 12px; text-transform: uppercase;
                      letter-spacing: 0.05em; color: #6b7280; margin-bottom: 10px; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
        .kv { display: flex; justify-content: space-between; font-size: 12px;
              padding: 4px 0; border-bottom: 1px solid #f0f0f0; }
        .kv span:first-child { color: #6b7280; }
        .kv span:last-child { font-weight: 500; text-align: right; max-width: 60%; }
        .reason { font-size: 11px; color: #6b7280; margin-top: 8px; line-height: 1.5; }

        /* File list */
        .file-list { list-style: none; font-size: 11px; font-family: monospace; color: #374151; }
        .file-list li { padding: 2px 0; border-bottom: 1px solid #f3f4f6; }
        .file-list li::before { content: "📄 "; }

        /* Table */
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        thead tr { background: #f3f4f6; }
        th { text-align: left; padding: 8px 10px; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb; }
        td { padding: 8px 10px; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
        tr:hover td { background: #fafafa; }

        /* Mermaid diagram */
        .diagram-container {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          overflow: hidden;
        }

        .mermaid {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        /* Misc */
        .badge { display: inline-block; padding: 2px 8px; border-radius: 999px;
                 font-size: 10px; font-weight: 600; color: #fff; }
        .mono { font-family: monospace; font-size: 11px; }
        .roadmap-item { padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 10px; }
        .roadmap-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
        .roadmap-header strong { font-size: 13px; }
        p { font-size: 12px; color: #555; line-height: 1.6; }
      </style>
      <script type="module">
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';

        mermaid.initialize({
          startOnLoad: true,
          securityLevel: "strict",
          theme: "neutral"
        });
      </script>
    </head>
    <body>
      <div class="header">
        <h1>Architecture Report</h1>
        <div class="prompt">"${a.prompt}"</div>
        <div class="meta">Generated: ${new Date(a.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} · ID: ${a._id}</div>
      </div>
      ${diagram}
      ${explanation}
      ${techStack}
      ${folderStructure}
      ${apiRoutes}
      ${dbSchema}
      ${roadmap}
    </body>
    </html>`;
}