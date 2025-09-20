"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { DetectionTool } from "@/components/detection-tool"
import { LearnSection } from "@/components/learn-section"
import { ScanHistory } from "@/components/scan-history"

export default function Home() {
  const [activeSection, setActiveSection] = useState<"detect" | "learn">("detect")
  const [scans, setScans] = useState<
    Array<{
      id: string
      filename: string
      result: "Original" | "Deepfake"
      confidence: number
      timestamp: Date
      imageUrl: string
    }>
  >([])

  const addScan = (scan: {
    id: string
    filename: string
    result: "Original" | "Deepfake"
    confidence: number
    timestamp: Date
    imageUrl: string
  }) => {
    setScans((prev) => [scan, ...prev])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--neon-glow),transparent_50%)] pointer-events-none" />

      <Navbar />

      <div className="flex">
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

        <main className="flex-1 p-6 ml-64">
          <div className="max-w-7xl mx-auto space-y-8">
            {activeSection === "detect" ? (
              <>
                <DetectionTool onScanComplete={addScan} />
                <ScanHistory scans={scans} />
              </>
            ) : (
              <LearnSection />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
