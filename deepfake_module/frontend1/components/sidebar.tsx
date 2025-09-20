"use client"

import { Scan, BookOpen, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SidebarProps {
  activeSection: "detect" | "learn"
  onSectionChange: (section: "detect" | "learn") => void
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 glass-card border-r">
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <Button
            variant={activeSection === "detect" ? "default" : "ghost"}
            className={cn(
              "w-full justify-start space-x-3 transition-all duration-300",
              activeSection === "detect" && "neon-glow bg-primary text-primary-foreground",
            )}
            onClick={() => onSectionChange("detect")}
          >
            <Scan className="h-5 w-5" />
            <span>Detection Tool</span>
          </Button>

          <Button
            variant={activeSection === "learn" ? "default" : "ghost"}
            className={cn(
              "w-full justify-start space-x-3 transition-all duration-300",
              activeSection === "learn" && "neon-glow bg-primary text-primary-foreground",
            )}
            onClick={() => onSectionChange("learn")}
          >
            <BookOpen className="h-5 w-5" />
            <span>Learn</span>
          </Button>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
            <History className="h-4 w-4" />
            <span>Recent Activity</span>
          </div>
          <div className="text-xs text-muted-foreground">Scan history appears here</div>
        </div>
      </div>
    </aside>
  )
}
