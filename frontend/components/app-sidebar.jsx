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

export function AppSidebar({ projects = [], selectedProjectId }) {

  const router = useRouter()
  const { toggleSidebar } = useSidebar()

  const [fetchedProjects, setFetchedProjects] = useState([]);
  const handleNewProject = () => {
    router.push("/")
  }

  useEffect(() => {
    const fetchProj = async () => {
      try {
        const res = await fetch("http://localhost:5000/projects");
        const result = await res.json();
        setFetchedProjects(result.data);

      } catch (err) {
        console.log(err);
      }
    }
    fetchProj();
  }, [fetchedProjects])


  return (
    <Sidebar>


      <SidebarHeader className="p-4 flex flex-row justify-between items-center">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
            <BrainCircuit className="size-5 text-primary-foreground" />
          </div>
        </Link>

        <button onClick={toggleSidebar} className="cursor-pointer">
          ✕
        </button>
      </SidebarHeader>

      <SidebarSeparator className="-ml-px" />

      <SidebarContent>

        <SidebarGroup>
          <div className="px-4 py-[6px] rounded-[8px] bg-primary mt-2">
            <Link
              href="/"
              onClick={handleNewProject}
              className="w-full flex flex-row items-center justify-start gap-2 text-[13px] font-medium text-[white]"
              size="sm"
            >
              <Plus className="size-4" />
              New Project
            </Link>
          </div>
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
                        isActive={selectedProjectId === project._id}
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
                        isActive={selectedProjectId === project._id}
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
        </div>

        {fetchedProjects.length === 0 && (
          <div className="px-3 py-6 text-xs text-muted-foreground">
            No projects yet.
            Generate your first architecture 🚀
          </div>
        )}

      </SidebarContent>
    </Sidebar>
  )
}