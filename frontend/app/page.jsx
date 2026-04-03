"use client"

import { useState } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ProjectInput } from "@/components/project-input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { BrainCircuit, Download, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ArchitectureCard } from "@/components/architecture-card"

export default function Dashboard() {
  const [projectIdea, setProjectIdea] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [architecture, setArchitecture] = useState(null)
  const [projects, setProjects] = useState([])
  const [ansGenerated, setAnsGenerated] = useState(false);

  const handleGenerate = async () => {
    if (!projectIdea) return

    setIsGenerating(true)
    setProjectIdea("");

    try {
      const res = await fetch("http://localhost:5000/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: projectIdea }),
      })

      const data = await res.json()

      if (data.success) {
        let parsed = data.data;

        if (typeof parsed === "string") {
          try {
            parsed = JSON.parse(parsed);
          } catch (e) {
            console.error("Invalid JSON from AI:", parsed);
            return;
          }
        }

        setArchitecture(parsed);
        setAnsGenerated(true);
      }

      const newProject = {
        id: Date.now(),
        name: projectIdea,
        data: data.data
      }

      setProjects((prev) => [newProject, ...prev])

    } catch (err) {
      console.error("Error generating architecture:", err)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border/40 bg-background/80 px-4 backdrop-blur-sm">
          <SidebarTrigger className="-ml-1 cursor-pointer" />
          <Separator orientation="vertical" className="h-4" />
          <div className="flex flex-1 items-center gap-2">
            <BrainCircuit className="size-4 text-primary" />
            <span className="font-medium">ArchGen</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 cursor-pointer">
              <Share2 className="size-3.5" />
              <p className="hidden md:flex">Share</p>
            </Button>
            <Button variant="outline" size="sm" className="gap-2 cursor-pointer">
              <Download className="size-3.5" />
              <p className="hidden md:flex">Export</p>
            </Button>
          </div>

        </header>

        <main className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-5xl space-y-8">
            <div style={{ display: ansGenerated ? "none" : "flex", flexDirection: "column", gap: "2rem" }}>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight text-balance">
                  What are you building?
                </h2>
                <p className="text-muted-foreground text-pretty">
                  Describe your project idea and we&apos;ll generate a complete technical architecture tailored to your needs.
                </p>
              </div>

              <ProjectInput
                value={projectIdea}
                onChange={setProjectIdea}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
              />
            </div>

            {architecture && (
              <div className="space-y-6">

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Generated Architecture</h3>
                    <p className="text-sm text-muted-foreground">
                      Based on your project idea
                    </p>
                  </div>

                  <Badge variant="secondary">
                    AI Generated
                  </Badge>
                </div>


                <ArchitectureCard data={architecture} />
              </div>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}