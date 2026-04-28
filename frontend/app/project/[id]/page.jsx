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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Copy } from "lucide-react"
import {Show, SignInButton, SignUpButton, UserButton, useAuth} from "@clerk/nextjs"
import { dark } from "@clerk/ui/themes"


export default function ProjectPage({ params }) {
    const { id } = use(params)
    const { userId, isSignedIn } = useAuth()
    const router = useRouter()
    const [project, setProject] = useState(null)
    const [loading, setLoading] = useState(false)

    const fetchProject = async () => {
        try {
            const res = await fetch(`http://localhost:5000/project/${id}`);
            const result = await res.json();
            setProject(result.data);
            console.log(project);
        } catch (err) {
            console.log(err);
        }
    }
    useEffect(() => {
        fetchProject();
    }, [id])

    const handleExport = async () => {
        if (!project) return;
        setLoading(true);

        try {
            const res = await fetch("/api/export-pdf", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ architecture: project }),
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

    const handleShare = async (chatId) => {
        try {
            const res = await fetch(`http://localhost:5000/chat/share/${chatId}`, { method: "POST" });

            const currentUrl = window.location.href;
            navigator.clipboard.writeText(currentUrl)
                .then(() => {
                    alert("Link copied to clipboard!");
                })
                .catch(err => {
                    console.error("Failed to copy: ", err);
                });
        } catch (e) {
            console.log(e);
        }
    }

    if (!project) {
        return (
            <SidebarProvider>
                <AppSidebar selectedProjectId={null} />
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
            <AppSidebar selectedProjectId={project._id} />
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
                            {/* <div className="flex items-center gap-2">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="gap-2 cursor-pointer">
                                            <Share2 className="size-3.5" />
                                            <p className="hidden md:flex">Share</p>
                                        </Button>

                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Share your chat link</DialogTitle>
                                            <DialogDescription>
                                                copy link
                                                <span className="flex items-center gap-1.5 mt-1">
                                                    <Input placeholder="euigwefgafbauisdfviufhguioefgefjbh" className="focus:outline-none focus:ring-0 border-[#8b90959d]" disabled />
                                                    <Copy className="size-4" onClick={handleShare} />
                                                </span>
                                            </DialogDescription>
                                        </DialogHeader>
                                    </DialogContent>
                                </Dialog>

                                <Button variant="outline" size="sm" className="gap-2 cursor-pointer" onClick={() => handleExport(project._id)} disabled={loading}>

                                    {loading ?

                                        "Exporting..." :

                                        <>
                                            <Download className="size-3.5" />
                                            <p className="hidden md:flex">Export</p>
                                        </>

                                    }

                                </Button>
                            </div> */}
                        </div>
                    </div>

                </header>


                <main className="flex-1 overflow-auto pt-4 p-8">
                    <div className="mx-auto max-w-5xl space-y-8">
                    <div className="max-w-fit max-h-fit">
                        <SidebarTrigger className="cursor-pointer bg-primary text-black" />
                    </div>
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
