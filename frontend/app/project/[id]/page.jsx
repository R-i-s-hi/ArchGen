"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ArchitectureCard } from "@/components/architecture-card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Layers, BrainCircuit, Download, Share2, ArrowLeft, Calendar, CheckCircle2, Clock, FileEdit } from "lucide-react"


export default function ProjectPage({ params }) {
    const { id } = use(params)
    const router = useRouter()
    const [project, setProject] = useState(null)

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await fetch(`http://localhost:5000/project/${id}`);
                const result = await res.json();
                setProject(result.data);
                console.log(result);
            } catch (err) {
                console.log(err);
            }
        }
        fetchProject();
    }, [id])

    if (!project) {
        return (
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <div className="flex h-full items-center justify-center">
                        <div className="text-center space-y-4">
                            <h2 className="text-xl font-semibold">Project not found</h2>
                            <Button onClick={() => router.push("/")} variant="outline">
                                <ArrowLeft className="size-4 mr-2" />
                                Back to Dashboard
                            </Button>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        )
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


                <main>
                    <div className="p-8 space-y-8">
                        <div>
                            <h1 className="text-3xl font-semibold">Project Details</h1>
                            <h1 className="text-md text-muted-foreground font-semibold">promt used: <i>"{project.prompt}"</i></h1>
                            {/* <p>Created at: {project.createdAt}</p>
                            <p>Updated at: {project.updatedAt}</p> */}
                            <hr className="my-4" />
                        </div>
                        <ArchitectureCard data={project} />
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>

    )
}
