"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  BrainCircuit,
  Plus,
  Clock,
  FolderKanban,
} from "lucide-react"

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
  SidebarSeparator,
} from "@/components/ui/sidebar"

import { useSidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@clerk/nextjs"


export function AppSidebar({ selectedProjectId }) {

  const { userId, isSignedIn } = useAuth()

  const router = useRouter()
  const { toggleSidebar } = useSidebar()

  const [fetchedProjects, setFetchedProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(selectedProjectId || null);
  const [guestId, setGuestId] = useState(null);

  useEffect(() => {
    const id = localStorage.getItem("guestId")
    setGuestId(id)
    console.log(id);
  }, [])

  useEffect(() => {
    const fetchProj = async () => {
      const ownerId = isSignedIn ? userId : guestId;
      if(!ownerId) return;

      try {
        const res = await fetch(`http://localhost:5000/projects?ownerId=${ownerId}`);

        const result = await res.json();
        setFetchedProjects(result.data);

      } catch (err) {
        console.log(err);
      }
    }
    fetchProj();
  }, [userId, isSignedIn, guestId])


  return (
    <Sidebar>

      <SidebarHeader className="p-4 flex flex-row justify-between items-center h-14 border-b border-border/40">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
            <BrainCircuit className="size-5 text-primary-foreground" />
          </div>
        </Link>

        <button onClick={toggleSidebar} className="cursor-pointer">
          ✕
        </button>
      </SidebarHeader>


      <SidebarContent>

        <SidebarGroup>
          <Button
            onClick={() => router.push("/")}
            className="justify-start min-w-35 h-7.5 gap-[0.4rem] text-[12.5px] cursor-pointer"
          >
            <Plus className="size-3.5" />
            New Chat
          </Button>
        </SidebarGroup>

        <div className="flex flex-col gap-2 h-full">

          {fetchedProjects.length > 0 && (
            <SidebarGroup className="h-[50%]">
              <SidebarGroupLabel className="flex items-center gap-2">
                <Clock className="size-3.5" />
                Recent
              </SidebarGroupLabel>

              <SidebarGroupContent>
                <SidebarMenu>
                  {fetchedProjects.map((project) => (
                    <SidebarMenuItem key={project._id}>
                      <SidebarMenuButton
                        onClick={() => router.push(`/project/${project._id}`)}
                        isActive={project._id === selectedProjectId}
                        className="cursor-pointer"
                      >
                        <FolderKanban className="size-4" />
                        <span className="truncate">{project.prompt}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}


          {fetchedProjects.length > 0 && (
            <SidebarGroup className="h-[50%]">
              <hr />
              <SidebarGroupLabel className="flex items-center gap-2">
                <FolderKanban className="size-3.5" />
                All Projects
              </SidebarGroupLabel>

              <SidebarGroupContent>
                <SidebarMenu>
                  {fetchedProjects.map((project) => (
                    <SidebarMenuItem key={project._id}>
                      <SidebarMenuButton
                        onClick={() => router.push(`/project/${project._id}`)}
                        isActive={project._id === selectedProjectId}
                        className="cursor-pointer"
                      >
                        <span className="truncate">{project.prompt}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {fetchedProjects.length === 0 && (
            <div className="flex items-center justify-center text-xs h-full text-center text-muted-foreground">
              No projects yet.
              Generate your first architecture
            </div>
          )}
        </div>


      </SidebarContent>
    </Sidebar>
  )
}