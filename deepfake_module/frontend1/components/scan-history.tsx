"use client"

import { Clock, CheckCircle, AlertTriangle, Download } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ScanHistoryProps {
  scans: Array<{
    id: string
    filename: string
    result: "Original" | "Deepfake"
    confidence: number
    timestamp: Date
    imageUrl: string
  }>
}

export function ScanHistory({ scans }: ScanHistoryProps) {
  if (scans.length === 0) {
    return (
      <Card className="glass-card p-8 text-center">
        <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
        <h3 className="text-lg font-semibold mb-2">No scans yet</h3>
        <p className="text-muted-foreground">Upload and analyze images to see your scan history here.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Scan History</h3>
        <Badge variant="outline" className="glass-card">
          {scans.length} scans
        </Badge>
      </div>

      <div className="grid gap-4">
        {scans.map((scan) => (
          <Card key={scan.id} className="glass-card p-4 hover:neon-border transition-all duration-300">
            <div className="flex items-center space-x-4">
              <img
                src={scan.imageUrl || "/placeholder.svg"}
                alt={scan.filename}
                className="w-16 h-16 object-cover rounded-lg"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium truncate">{scan.filename}</h4>
                  <Badge
                    variant={scan.result === "Original" ? "default" : "destructive"}
                    className={cn(scan.result === "Original" ? "bg-primary" : "bg-destructive")}
                  >
                    {scan.result === "Original" ? (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    ) : (
                      <AlertTriangle className="w-3 h-3 mr-1" />
                    )}
                    {scan.result}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Confidence: {scan.confidence}%</span>
                  <span>{scan.timestamp.toLocaleString()}</span>
                </div>
              </div>

              <Button variant="ghost" size="icon" className="hover:neon-border">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
