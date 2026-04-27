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
    <Card className="border-border/60 bg-card/50 backdrop-blur">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Describe your project idea
            </label>
            <Textarea
              id="project-input"
              placeholder="e.g., A real-time collaborative whiteboard app with AI-powered shape recognition, supporting multiple users and export to various formats..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="focus:outline-none focus:ring-0 focus-visible:ring-0 mt-2 min-h-[120px] max-h-[200px] resize-none bg-background/50 text-sm placeholder:text-muted-foreground/60 overflow-y-auto"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground hidden md:flex">
              Be specific about features, scale, and technical requirements
            </p>
            <Button
              onClick={onGenerate}
              disabled={!value.trim() || isGenerating}
              className="min-w-[140px] gap-2 cursor-pointer"
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
