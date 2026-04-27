"use-client"

import { useState } from "react"
import { Database, Server, Globe, Cpu, Cloud, Code2, Copy, Check } from "lucide-react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ProjectInput } from "@/components/project-input"
import { Badge } from "@/components/ui/badge"
import { BrainCircuit, Download, Share2 } from "lucide-react"
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { Button } from "@/components/ui/button"
import { ArchitectureCard } from "@/components/architecture-card"
import { dark } from "@clerk/ui/themes"
import "./dashboard.css"


function DashboardContent() {

    const [projectIdea, setProjectIdea] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)
    const [ansGenerated, setAnsGenerated] = useState(false)
    const [architecture, setArchitecture] = useState(null)
    const [loading, setLoading] = useState(false)


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

        } catch (err) {
            console.error("Error generating architecture:", err)
        } finally {
            setIsGenerating(false)
        }
    }

    const handleExport = async () => {
        if (!architecture?.length) return;
        setLoading(true);

        try {
            const res = await fetch("/api/export-pdf", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ architecture }),
            });

            if (!res.ok) throw new Error("Export failed");

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `chat-${Date.now()}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            alert("Failed to export PDF. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <AppSidebar selectedProjectId={architecture} />
            <SidebarInset>
                <header className="sticky top-0 z-10 flex h-14 items-center justify-center border-b border-border/40 bg-background/80 px-4 backdrop-blur-md">

                    <div className="flex items-center justify-center w-full max-w-5xl">
                        <div className="flex flex-1 items-center gap-2">
                            <BrainCircuit className="size-5 text-primary" />
                            <span className="font-larger">ArchGen</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Show when="signed-out" >
                                <SignInButton>
                                    <p className="text-[12px] text-muted-foreground cursor-pointer hover:text-white mr-3">Sign in</p>
                                </SignInButton>
                                <SignUpButton>
                                    <Button className="py-0.5 px-3 text-[11px] font-medium cursor-pointer h-6.5 w-fit">
                                        Signup
                                    </Button>
                                </SignUpButton>
                            </Show>
                            <Show when="signed-in">
                                <UserButton appearance={{theme: dark}}/>
                            </Show>
                        </div>
                    </div>

                </header>

                <main className="flex-1 overflow-auto pt-4 p-8">
                    <div className="mx-auto max-w-5xl space-y-8 ">
                        <div className="max-w-fit max-h-fit">
                            <SidebarTrigger className="cursor-pointer bg-primary text-black" />
                        </div>
                        <div style={{ display: ansGenerated ? "none" : "flex", flexDirection: "column", gap: "2rem" }}>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-semibold tracking-tight text-balance">
                                    What are you building?
                                </h2>
                                <p className="text-muted-foreground text-pretty">
                                    Describe your project idea and we'll generate a complete technical architecture tailored to your needs.
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

                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Card 1 - Architecture Diagram */}
                            <div className="group relative overflow-hidden border border-blue-500/20 bg-blue-500/10 transition-all hover:border-blue-600/40 hover:shadow-lg hover:shadow-blue-500/5 rounded-lg">
                                <div className="flex flex-row items-start justify-between gap-4 pb-3 p-6">
                                    <div className="flex items-start gap-3">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20">
                                            <Globe className="size-5 text-blue-400" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-base font-semibold leading-tight">System Architecture</h3>
                                            <p className="text-sm text-muted-foreground leading-relaxed">A full visual map of your app's components and how they connect</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-6 pb-6 space-y-4">
                                    <div className="flex flex-wrap gap-1.5">
                                        {["Frontend", "Backend", "Database", "APIs", "Auth"].map((tech) => (
                                            <span key={tech} className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-normal bg-secondary text-secondary-foreground">{tech}</span>
                                        ))}
                                    </div>
                                    <div className="space-y-2 border-t border-border/50 pt-3">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">What you get</p>
                                        <ul className="space-y-1.5">
                                            {["Layer-by-layer breakdown of your stack", "Data flow between services", "Clear separation of concerns"].map((detail, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                    <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
                                                    {detail}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2 - Tech Stack */}
                            <div className="group relative overflow-hidden border border-green-500/20 bg-green-500/10 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 rounded-lg">
                                <div className="flex flex-row items-start justify-between gap-4 pb-3 p-6">
                                    <div className="flex items-start gap-3">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-green-500/10 border border-green-500/20">
                                            <Code2 className="size-5 text-green-400" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-base font-semibold leading-tight">Tech Stack Recommendations</h3>
                                            <p className="text-sm text-muted-foreground leading-relaxed">Opinionated, modern stack choices tailored to your project goals</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-6 pb-6 space-y-4">
                                    <div className="flex flex-wrap gap-1.5">
                                        {["Next.js", "Node.js", "PostgreSQL", "Docker", "Vercel"].map((tech) => (
                                            <span key={tech} className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-normal bg-secondary text-secondary-foreground">{tech}</span>
                                        ))}
                                    </div>
                                    <div className="space-y-2 border-t border-border/50 pt-3">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">What you get</p>
                                        <ul className="space-y-1.5">
                                            {["Best-fit tools for your use case", "Reasoning behind each choice", "Alternatives with trade-offs explained"].map((detail, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                    <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
                                                    {detail}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Card 3 - Database Schema */}
                            <div className="group relative overflow-hidden border border-orange-500/20 bg-orange-500/10 transition-all hover:border-orange-600/40 hover:shadow-lg hover:shadow-orange-500/5 rounded-lg">
                                <div className="flex flex-row items-start justify-between gap-4 pb-3 p-6">
                                    <div className="flex items-start gap-3">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 border border-orange-500/20">
                                            <Database className="size-5 text-orange-400" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-base font-semibold leading-tight">Database Schema</h3>
                                            <p className="text-sm text-muted-foreground leading-relaxed">Production-ready data models designed for scale and clarity</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-6 pb-6 space-y-4">
                                    <div className="flex flex-wrap gap-1.5">
                                        {["Tables", "Relations", "Indexes", "Migrations", "Prisma"].map((tech) => (
                                            <span key={tech} className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-normal bg-secondary text-secondary-foreground">{tech}</span>
                                        ))}
                                    </div>
                                    <div className="space-y-2 border-t border-border/50 pt-3">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">What you get</p>
                                        <ul className="space-y-1.5">
                                            {["Entity relationships mapped out", "Normalized schema with no redundancy", "Ready-to-run migration files"].map((detail, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                    <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
                                                    {detail}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Card 4 - Share & Export */}
                            <div className="group relative overflow-hidden border border-purple-500/20 bg-purple-500/10 transition-all hover:border-purple-600/40 hover:shadow-lg hover:shadow-purple-500/5 rounded-lg">
                                <div className="flex flex-row items-start justify-between gap-4 pb-3 p-6">
                                    <div className="flex items-start gap-3">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20">
                                            <Share2 className="size-5 text-purple-400" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-base font-semibold leading-tight">Share & Export</h3>
                                            <p className="text-sm text-muted-foreground leading-relaxed">Share your architecture with your team or export the full project in one click</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-6 pb-6 space-y-4">
                                    <div className="flex flex-wrap gap-1.5">
                                        {["Public Link", "PDF Export", "Copy Link"].map((tech) => (
                                            <span key={tech} className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-normal bg-secondary text-secondary-foreground">{tech}</span>
                                        ))}
                                    </div>
                                    <div className="space-y-2 border-t border-border/50 pt-3">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">What you get</p>
                                        <ul className="space-y-1.5">
                                            {["Shareable chat link for teammates or clients", "Export full project as PDF, Markdown, or JSON", "Preserve full conversation history"].map((detail, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                    <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
                                                    {detail}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </SidebarInset>
        </>
    )
}

export default function Dashboard() {


    return (
        <SidebarProvider>
            <DashboardContent />
        </SidebarProvider>
    )
}
