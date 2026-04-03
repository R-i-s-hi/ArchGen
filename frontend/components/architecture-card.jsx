"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Recursive renderer for nested objects/arrays
const RenderFields = ({ fields }) => {
  if (!fields || typeof fields !== "object" || Array.isArray(fields)) return null;

  return (
    <ul className="text-sm ml-4 list-disc">
      {Object.entries(fields).map(([key, value]) => (
        <li key={key}>
          <span className="font-medium">{key}:</span>{" "}
          {Array.isArray(value) ? (
            <ul className="ml-4 list-disc">
              {value.map((item, idx) => (
                <li key={idx}>
                  {typeof item === "object" && item !== null ? (
                    <RenderFields fields={item} />
                  ) : (
                    String(item)
                  )}
                </li>
              ))}
            </ul>
          ) : typeof value === "object" && value !== null ? (
            // Special case: if the object has a "src" key, render it as an image
            value.src ? (
              <img src={value.src} alt={key} className="max-w-xs rounded" />
            ) : (
              <RenderFields fields={value} />
            )
          ) : (
            String(value)
          )}
        </li>
      ))}
    </ul>
  );
};




export function ArchitectureCard({ data }) {
  console.log(data);
  if (!data || typeof data !== "object") {
    return <p>Invalid data</p>;
  }

  return (
    <>
      <div>
        {data.explanation && data.explanation.length > 0 && (
          <>
            <h3 className="text-xl font-semibold ml-1.5 mb-3">
              Why this architecture?
            </h3>

            <Card className="mb-12">
              <CardContent>
                {data.explanation.map((e, i) => (
                  <div className="mb-2" key={i}>
                    <strong> • {e.title}</strong>
                    <p className="ml-[10px] text-[#f5f5f5d6]">{e.reason}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )}
      </div>
      <div className="grid grid-cols-1 gap-y-7 md:gap-y-12 gap-x-7 md:grid-cols-2">

        <div>

          <h3 className="text-xl font-semibold ml-1.5 mb-3">
            Tech Stack
          </h3>
          <Card className="max-h-fit">
            {/* <CardHeader>
            <CardTitle>Tech Stack</CardTitle>
          </CardHeader> */}
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Frontend</h3>
                <div className="flex gap-2 flex-wrap">
                  {Object.values(data?.tech_stack?.frontend || {}).map((value, i) => (
                    <Badge key={i}>{value}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Backend</h3>
                <div className="flex gap-2 flex-wrap">
                  {Object.values(data?.tech_stack?.backend || {}).map((item, i) => (
                    <Badge key={i}>{item}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Database</h3>
                <Badge>
                  {data?.tech_stack?.database?.type}
                </Badge>
                <p className="text-xs text-muted-foreground" style={{ marginTop: "0.3rem" }}>
                  {data?.tech_stack?.database?.reason}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>

          <h3 className="text-xl font-semibold mt-6 md:mt-0 ml-1.5 mb-3">
            API Routes
          </h3>
          <Card>
            {/* <CardHeader>
            <CardTitle>API Routes</CardTitle>
          </CardHeader> */}
            <CardContent>
              <Table>
                <TableCaption className="text-[12px]">These are main API routes which will create the app. You can create your custom Routes</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Method</TableHead>
                    <TableHead>Path</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.api_routes?.map?.((route, i) => (
                    <TableRow key={i} className="border-t">
                      <TableCell className="font-medium">{route.method}</TableCell>
                      <TableCell>{route.path}</TableCell>
                      <TableCell>{route.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div>

          <h3 className="text-xl font-semibold mt-6 md:mt-0 ml-1.5 mb-3">
            Folder Structure
          </h3>
          <Card>
            {/* <CardHeader>
            <CardTitle>Folder Structure</CardTitle>
          </CardHeader> */}
            <CardContent>

              <ul className="font-mono text-sm space-y-1">
                {data?.folder_structure?.map?.((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>

              {data.folder_structure.frontend && (<p>Frontend: </p>)}
              <ul className="font-mono text-sm space-y-1">
                {data?.folder_structure?.frontend?.map?.((f, i) => (
                  <li key={i}>{f}</li>
                ))}

              </ul>

              {data.folder_structure.frontend && (<p>Backend: </p>)}
              <ul className="font-mono text-sm space-y-1">
                {data?.folder_structure?.backend?.map?.((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div>

          <h3 className="text-xl font-semibold mt-6 md:mt-0 ml-1.5 mb-3">
            Database Schema
          </h3>
          <Card>
            {/* <CardHeader>
            <CardTitle>Database Schema</CardTitle>
          </CardHeader> */}
            <CardContent>
              {Object.entries(data?.database_schema || {}).map(([model, fields]) => (
                <div key={model} className="mb-4">
                  <h3 className="font-semibold">{model}</h3>
                  <RenderFields fields={fields} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div>

          <h3 className="text-xl font-semibold mt-6 md:mt-0 ml-1.5 mb-3">
            Feature Roadmap
          </h3>
          <Card>
            {/* <CardHeader>
            <CardTitle>Feature Roadmap</CardTitle>
          </CardHeader> */}
            <CardContent>
              {(data?.feature_roadmap || {}).map((f, i) => (
                <div key={i} className="mb-2">
                  <Badge>{f.name}</Badge>
                  <p className="text-sm text-muted-foreground ml-[7px] font-semibold">{f.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

      </div>
    </>
  )
}