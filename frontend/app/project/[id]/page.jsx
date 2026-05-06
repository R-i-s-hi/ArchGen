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
    DialogFooter,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog"
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldLabel,
    FieldTitle,
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Spinner } from "@/components/ui/spinner"
import { Input } from "@/components/ui/input"
import { Copy, HatGlasses, ChevronRightIcon } from "lucide-react"
import { Show, SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs"
import { dark } from "@clerk/ui/themes"

import "./page.css"
import { toast } from "sonner"


export default function ProjectPage({ params }) {
    const { id } = use(params)
    const { userId, isSignedIn } = useAuth()
    const router = useRouter()
    const [project, setProject] = useState(null)
    const [loading, setLoading] = useState(false)
    const [showPrompt, setShowPrompt] = useState(false)
    const [shareLink, setShareLink] = useState("")
    const [visibility, setVisibility] = useState("anyone");
    const [restrictUserId, setRestrictUserId] = useState("");
    const [ids, setIds] = useState([]);

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
        console.log(chatId);
        try {
            const res = await fetch(`http://localhost:5000/chat/share/${chatId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ownerId: project.ownerId, restrictedUsers: ids }),
            });

            const data = await res.json();
            if (data?.shareLink) setShareLink(data.shareLink);
        } catch (e) {
            console.log(e);
        }
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(shareLink)
            .then(() => {
                toast.success("Link Copied!", {position: "bottom-right"})
            })
            .catch(err => {
                console.error("Failed to copy: ", err);
            });
        setShareLink("");
        setIds([]);
        setRestrictUserId("");
    }

    const handleCopyUserId = async() => {
        navigator.clipboard.writeText(userId)
            .then(() => {
                toast.success("ID copied to clipboard!", { position: "top-center" });
            })
            .catch(err => {
                console.error("Failed to copy: ", err);
            });
    }

    const handleAddUserIds = async() => {
        if (!restrictUserId.trim()) return;
        setIds(prev => [...prev, restrictUserId.trim()]);
        setRestrictUserId("");
    }

    const DateShow = (inputDate) => {
        const dateObj = new Date(inputDate);

        const formatted = dateObj.toLocaleDateString("en-US", {
            weekday: "short",   // Tue
            year: "numeric",    // 2026
            month: "long",      // April
            day: "numeric"      // 28
        });

        const time = dateObj.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit"
        });

        return `${formatted} at ${time}`;
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
                                <div className="flex items-center gap-3">

                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-2 cursor-pointer h-7 w-7 md:w-auto"
                                            >
                                                <Share2 className="size-3" />
                                                <span className="hidden md:flex text-xs">Share</span>
                                            </Button>
                                        </DialogTrigger>

                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Share your chat link</DialogTitle>

                                                <DialogDescription className="mt-3 pl-3">
                                                    Choose how you want to share your chat.<br/>You can use the chat link for 3 days.
                                                </DialogDescription>


                                                <div className="my-6 space-y-3">
                                                    <Collapsible>
                                                        <CollapsibleTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="group h-7 w-fit rounded-2xl justify-start gap-1 cursor-pointer text-[#939398] transition-none hover:bg-[#1c1c1f] hover:text-[#b5b5bb]"
                                                            >
                                                                <HatGlasses className="size-3" />
                                                                <span className="text-[12px]">Choose Visibility</span>
                                                                <ChevronRightIcon className="ml-2 transition-transform group-data-[state=open]:rotate-90" />
                                                            </Button>
                                                        </CollapsibleTrigger>

                                                        <CollapsibleContent className="p-3">
                                                            <RadioGroup
                                                                value={visibility}
                                                                onValueChange={setVisibility}
                                                                className="max-w-full text-left"
                                                            >
                                                                <FieldLabel className="cursor-pointer text-left" htmlFor="anyone">
                                                                    <Field orientation="horizontal">
                                                                        <FieldContent>
                                                                            <FieldTitle>Anyone</FieldTitle>
                                                                            <span className="text-muted-foreground text-sm">
                                                                                Anyone can see your chat.
                                                                            </span>
                                                                        </FieldContent>
                                                                        <RadioGroupItem value="anyone" id="anyone" />
                                                                    </Field>
                                                                </FieldLabel>

                                                                <FieldLabel className="cursor-pointer text-left" htmlFor="restricted">
                                                                    <Field orientation="horizontal">
                                                                        <FieldContent>
                                                                            <FieldTitle>Restricted</FieldTitle>
                                                                            <span className="text-muted-foreground text-sm">
                                                                                Only granted users can see the chat.
                                                                            </span>
                                                                        </FieldContent>
                                                                        <RadioGroupItem value="restricted" id="restricted" />
                                                                    </Field>
                                                                </FieldLabel>
                                                            </RadioGroup>

                                                            {/* Conditional input for Restricted */}
                                                            {visibility === "restricted" && (
                                                                <>
                                                                    {ids.length > 0 && (
                                                                            <span className="text-left text-[11px] text-[#f5f5f5] w-full">
                                                                                <i>{ids.length} user added</i>
                                                                            </span>
                                                                        )}
                                                                    <div className="flex gap-1 items-center">
                                                                        <Input
                                                                            value={restrictUserId}
                                                                            onChange={(e) => setRestrictUserId(e.target.value)}
                                                                            placeholder="Enter userId"
                                                                            className=" mt-2 h-8 text-[12px] border-[#8b90959d] focus:outline-none focus:ring-0"
                                                                            
                                                                        /> 
                                                                        <Button variant="secondary" className="h-8 mt-2 text-[12px] cursor-pointer" onClick={handleAddUserIds}>
                                                                            Add
                                                                        </Button>


                                                                    </div>
                                                                </>
                                                            )}
                                                        </CollapsibleContent>
                                                            <hr className="opacity-30 my-1" />
                                                    </Collapsible>

                                                    <Input
                                                        value={shareLink}
                                                        className="focus:outline-none focus:ring-0 text-[11px] border-[#8b90959d] h-8 bg-[#1c1c1f]"
                                                        disabled
                                                    />
                                                </div>
                                            </DialogHeader>

                                            <DialogFooter>
                                                <Button
                                                    className="h-8 cursor-pointer"
                                                    onClick={() => handleShare(id)}
                                                >
                                                    <span>Get Link</span>
                                                </Button>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        className="h-8 cursor-pointer"
                                                        onClick={handleCopy}
                                                        disabled={shareLink.length === 0}
                                                    >
                                                        <span>Copy</span>
                                                        <Copy className="size-4" />
                                                    </Button>
                                                </DialogTrigger>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>

                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="gap-2 cursor-pointer h-7 w-7 md:w-auto">
                                                <Download className="size-3" />
                                                <p className="hidden md:flex text-xs">Export</p>
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Export PDF</DialogTitle>
                                                {!loading ? (
                                                    <>
                                                        <DialogDescription className="my-6 space-y-3">
                                                            <span>Generate a precise and well‑ordered PDF containing all project details, formatted for easy sharing and record‑keeping.</span>
                                                        </DialogDescription>
                                                    </>
                                                ) : (
                                                    <p className="my-6 flex justify-center items-center text-center">
                                                        <Spinner />&nbsp;&nbsp;Loading...
                                                    </p>
                                                )}
                                            </DialogHeader>
                                            <DialogFooter>
                                                <DialogClose asChild>
                                                    <Button className="h-8 cursor-pointer">
                                                        <span>Cancel</span>
                                                    </Button>
                                                </DialogClose>

                                                <Button className="h-8 cursor-pointer" onClick={() => handleExport(project._id)} disabled={loading}>
                                                    <span>Download</span>
                                                    <Download className="size-4" />
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>

                                    <UserButton appearance={{ theme: dark }}>
                                        <UserButton.MenuItems>
                                            <UserButton.Action 
                                                label="Copy UserId"
                                                labelIcon={<Copy className="size-3 ml-0.5"/>}
                                                onClick={() => handleCopyUserId()}
                                            />
                                            <UserButton.Action label="manageAccount" />
                                            <UserButton.Action label="signOut" />
                                        </UserButton.MenuItems>
                                    </UserButton>
                                </div>
                            </Show>
                        </div>
                    </div>

                </header>


                <main className="flex-1 overflow-auto pt-4 p-8">
                    <div className="mx-auto max-w-5xl space-y-8">
                        <div className="max-w-fit max-h-fit">
                            <SidebarTrigger className="cursor-pointer bg-primary text-black" />
                        </div>
                        <div>
                            <div className="flex justify-between items-top">
                                <h1 className="text-3xl font-semibold">Project Details</h1>
                                <div className="text-end leading-none">
                                    <p className="text-muted-foreground text-xs font-semibold"><i>{DateShow(project.createdAt)}</i></p>
                                    <Button className="p-0 text-xs h-fit cursor-pointer" variant="link" onClick={() => setShowPrompt(true)}>
                                        <i>View full prompt</i>
                                    </Button>
                                    {showPrompt && (
                                        <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
                                            <DialogContent className="fixed top-25 left-1/2 -translate-x-1/2 sm:max-w-sm">
                                                <DialogHeader>
                                                    <DialogTitle>Original Prompt</DialogTitle>
                                                    <DialogDescription>{project.prompt}</DialogDescription>
                                                </DialogHeader>
                                            </DialogContent>
                                        </Dialog>
                                    )}
                                </div>

                            </div>
                            <hr className="my-4" />
                        </div>
                        <ArchitectureCard data={project} />
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>

    )
}
