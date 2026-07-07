"use client"

import { Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import "./project-input.css"

export function ProjectInput({
  value,
  onChange,
  onGenerate,
  isGenerating,
}) {
  return (
    <Card className="border-border/60 rounded-[20px] bg-card/50 backdrop-blur sm:py-6 py-4">
      <CardContent className="sm:px-4 px-2 py-0">
        <div className="space-y-0">
          <div className="space-y-0">
            <Textarea
              id="project-input"
              placeholder="Write a detailed description of your project"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="min-h-[90px] max-h-[130px] border-none focus:outline-none focus:ring-0 focus-visible:ring-0 resize-none bg-inherit text-sm placeholder:text-muted-foreground/60 overflow-y-auto"
            />
          </div>

          <div className="flex items-center justify-between pl-3 gap-4">
            <p className="text-xs text-muted-foreground hidden md:flex">
              *Be specific about features, scale, and technical requirements
            </p>
            <Button
              onClick={onGenerate}
              disabled={!value.trim() || isGenerating}
              className="min-w-35 gap-2 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
