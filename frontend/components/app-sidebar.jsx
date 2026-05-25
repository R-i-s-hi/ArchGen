"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  BrainCircuit,
  Clock,
  FolderKanban,
  Search,
  SquarePen,
  Pencil,
  Pin,
  EllipsisVertical,
  PanelRightOpen,
  Trash2
} from "lucide-react"

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
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"

import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu"

import { useSidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useAuth, useUser } from "@clerk/nextjs"
import "./app-sidebar.css"
import { toast } from "sonner"


export function AppSidebar({ selectedProjectId }) {

  const { userId, isSignedIn } = useAuth()
  const { user } = useUser()

  const router = useRouter()
  const { toggleSidebar } = useSidebar()

  const [fetchedProjects, setFetchedProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(selectedProjectId || null);
  const [guestId, setGuestId] = useState(null);
  const [projectTitle, setProjectTitle] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    const id = localStorage.getItem("guestId")
    setGuestId(id)
    console.log(id);
  }, [])

  const fetchProj = async () => {
    const ownerId = isSignedIn ? userId : guestId;
    if (!ownerId) return;

    try {
      const res = await fetch(`http://localhost:5000/projects?ownerId=${ownerId}`);

      const result = await res.json();
      setFetchedProjects(result.data);
      setProjectTitle(result.data.map(p => p.title));
    } catch (err) {
      console.log(err);
    }
  }
  useEffect(() => {
    fetchProj();
  }, [userId, isSignedIn, guestId])

  const handleEditKeyDown = async (projectId, title, e) => {
      if (e.key === "Enter") {
        try {
          const newTitle = title.trim();
          const res = await fetch(`http://localhost:5000/project/${projectId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: newTitle }),
          });

          if (!res.ok) {
            throw new Error("Failed to update project");
          }

          setEditingIndex(null);
          fetchProj();
          toast.success("Project title updated!");
        } catch (err) {
          console.error(err);
          toast.error("Could not update project");
        }
      }

      if (e.key === "Escape") {
        setEditingIndex(null);
      }

  }

  const handleDeleteProject = async (projectId) => {
    try {
      const res = await fetch(`http://localhost:5000/project/${projectId}`, {
        method: "DELETE",
      });

      if(res.ok) {
        if (activeProject === projectId) {
          setActiveProject(null);
          router.push("/");
          toast.success("Project deleted!");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not delete project");
    }
  }

  const handlePinProject = (projectId) => {
    toast("Feature coming soon!");
  }

  return (
    <Sidebar>
      <SidebarHeader className="pr-4 flex flex-row justify-between items-center h-14 border-b border-border/40">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center shadow-xl rounded">
            <BrainCircuit className="size-5 shadow-accent-foreground" />
          </div>
        </Link>

        <button onClick={toggleSidebar} className="cursor-pointer text-[12px]" >
          <PanelRightOpen className="size-4" />
        </button>
      </SidebarHeader>

      <SidebarContent className="pt-3 chatsContainer">

        <SidebarGroup className="gap-[4px]">
          <SidebarGroupContent className="flex flex-col gap-[4px]">
            <Button
              onClick={() => router.push("/")}
              className="justify-start min-w-full h-8.5 gap-[0.4rem] rounded-[11px] text-[13px] cursor-pointer"
            >
              <SquarePen className="size-4" />
              <span className="-mb-[3px]">New chat</span>
            </Button>

            <Button
              variant="ghost"
              className="justify-start min-w-full h-8.5 gap-[0.4rem] rounded-[11px] text-[13px] cursor-pointer text-gray-400 hover:bg-secondary hover:text-white"
            >
              <Search className="size-4" />
              <span className="-mb-[3px]">Search chats</span>
            </Button>

            <div className="flex justify-start min-w-full gap-[0.4rem] rounded-[11px] text-[12.5px] cursor-pointer">
              {/* <Input className="placeholder:text-[12.5px] h-8.5" placeholder="Search projects..." />
              <Button className="h-8.5">
                <Search className="size-3.5" />
              </Button> */}

            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2 text-[13px] text-white">
            <Clock className="size-3.5" />
            Recent
          </SidebarGroupLabel>

          {fetchedProjects.length > 0 && (
            <SidebarGroupContent>
              <SidebarMenu>
                {fetchedProjects.map((project, i) => (
                  <SidebarMenuItem key={project._id}>
                    <div className="flex items-center relative chat text-white/90 rounded-[8px] bg-transparent hover:bg-secondary hover:text-white">
                      <SidebarMenuButton
                        onClick={(e) => {
                          if (editingIndex === i) return;
                          if (e.target.closest('[data-dropdown-trigger]')) return;
                          router.push(`/project/${project._id}`);
                        }}
                        isActive={project._id === selectedProjectId}
                        className="flex-1 bg-inherit rounded-tr-[0] rounded-br-[0] hover:bg-inherit hover:text-inherit cursor-pointer"
                      >
                        <FolderKanban className="size-3.5" />
                        {editingIndex === i ? (
                          <input
                            autoFocus
                            type="text"
                            className="bg-transparent border-b border-white/30 text-sm w-full outline-none"
                            value={projectTitle[i] ?? ""}
                            onChange={(e) => {
                              const next = [...projectTitle];
                              next[i] = e.target.value;
                              setProjectTitle(next);
                            }}
                            onBlur={() => setEditingIndex(null)}
                            onKeyDown={(e) => handleEditKeyDown(project._id, projectTitle[i], e)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span className="truncate">{project.title}</span>
                        )}

                      </SidebarMenuButton>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <div
                            className={`w-fit h-8 flex justify-center items-center rounded-tr-[8px] rounded-br-[8px] ${project._id === selectedProjectId ? 'bg-secondary/80': 'bg-inherit'} text-muted-foreground cursor-pointer focus:outline-none focus:ring-0 border-0 hover:text-white/90`}
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                            }}
                            isActive={project._id === selectedProjectId}
                          >
                            <EllipsisVertical className="size-3.5" />
                          </div>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                          side="right"
                          align="start"
                        >
                          <DropdownMenuGroup>
                            <DropdownMenuItem className="dropdown-item" onSelect={() => setEditingIndex(i)}>
                              <Pencil className="text-inherit size-[13px]" />
                              <span className="text-inherit">Edit</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem className="dropdown-item" onSelect={() => handlePinProject(project._id)}>
                              <Pin className="text-inherit size-[13px]" />
                              <span className="text-inherit">Pin</span>
                            </DropdownMenuItem>
                          </DropdownMenuGroup>

                          <DropdownMenuSeparator style={{ marginInline: '0.2rem' }} />
                          <DropdownMenuGroup>

                            <DropdownMenuItem className="dropdown-delete-item" onSelect={() => handleDeleteProject(project._id)}>
                              <Trash2 className="text-inherit size-[13px]" />
                              <span className="text-inherit -mb-[2px]">Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          )}

          {fetchedProjects.length === 0 && (
            <div className="flex items-center justify-center text-xs pt-8 h-full text-center text-muted-foreground">
              No projects yet. <br />
              Generate your first architecture
            </div>
          )}
        </SidebarGroup>


      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <div className="flex justify-start items-center bg-secondary/50 h-14 rounded-[11px] py-2 gap-3 p-2 w-full cursor-pointer hover:bg-secondary/60 hover:text-white/90">

            <div className="bg-secondary text-xl p-4 rounded-[50%] size-8.5 flex items-center justify-center">
              <span className="text-white text-[14px]">
                {isSignedIn && user?.firstName ? (
                  <>{user.firstName.charAt(0).toUpperCase()}</>
                )
                  : 'G'}
              </span>
            </div>
            <div className="flex-col">
              {isSignedIn && user?.firstName ? (
                <>
                  <p className="text-sm">{user.firstName}</p>
                  <p className="text-xs text-muted-foreground">{user.primaryEmailAddress?.emailAddress}</p>
                </>
              ) : 'Guest'}
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar >
  )
}