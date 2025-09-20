"use client"

import { useState, useCallback } from "react"
import { Upload, ImageIcon, X, Zap, CheckCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface DetectionToolProps {
  onScanComplete: (scan: {
    id: string
    filename: string
    result: "Original" | "Deepfake"
    confidence: number
    timestamp: Date
    imageUrl: string
  }) => void
}

interface UploadedImage {
  id: string
  file: File
  url: string
  status: "pending" | "analyzing" | "complete" | "error"
  result?: "Original" | "Deepfake"
  confidence?: number
}

export function DetectionTool({ onScanComplete }: DetectionToolProps) {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/"))

    files.forEach((file) => {
      const id = Math.random().toString(36).substr(2, 9)
      const url = URL.createObjectURL(file)
      setImages((prev) => [...prev, { id, file, url, status: "pending" }])
    })
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach((file) => {
      const id = Math.random().toString(36).substr(2, 9)
      const url = URL.createObjectURL(file)
      setImages((prev) => [...prev, { id, file, url, status: "pending" }])
    })
  }

  const analyzeImage = async (imageId: string) => {
    setImages((prev) => prev.map((img) => (img.id === imageId ? { ...img, status: "analyzing" } : img)))

    const image = images.find((img) => img.id === imageId)
    if (!image) return

    try {
      // Prepare FormData for backend
      const formData = new FormData()
      formData.append("files", image.file)

      // Call FastAPI backend
      const response = await fetch("http://127.0.0.1:8000/detect/", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error(`Server error: ${response.status}`)
      const data = await response.json()

      // Our backend returns { results: [ { filename, label, confidence } ] }
      const result = data.results[0]
      const label = result.label === "deepfake" ? "Deepfake" : "Original"
      const confidence = Math.round(result.confidence * 100)

      setImages((prev) =>
        prev.map((img) =>
          img.id === imageId
            ? { ...img, status: "complete", result: label, confidence }
            : img
        )
      )

      onScanComplete({
        id: imageId,
        filename: image.file.name,
        result: label,
        confidence,
        timestamp: new Date(),
        imageUrl: image.url,
      })
    } catch (error) {
      console.error("Detection failed:", error)
      setImages((prev) =>
        prev.map((img) =>
          img.id === imageId ? { ...img, status: "error" } : img
        )
      )
    }
  }

  const removeImage = (imageId: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === imageId)
      if (image) URL.revokeObjectURL(image.url)
      return prev.filter((img) => img.id !== imageId)
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          AI Deepfake Detection
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Upload images to analyze them with our AI technology. Get authenticity results in seconds.
        </p>
      </div>

      {/* Upload Area */}
      <Card
        className={cn(
          "glass-card p-8 border-2 border-dashed transition-all duration-300 cursor-pointer hover:neon-border",
          isDragOver && "neon-glow border-primary"
        )}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
      >
        <div className="text-center space-y-4">
          <Upload className="w-16 h-16 text-primary mx-auto animate-float" />
          <div>
            <h3 className="text-xl font-semibold mb-2">Drop images here or click to upload</h3>
            <p className="text-muted-foreground">Supports JPG, PNG, WebP formats. Multiple files allowed.</p>
          </div>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Button className="neon-border hover:neon-glow transition-all duration-300">
            <ImageIcon className="w-4 h-4 mr-2" />
            Select Images
          </Button>
        </div>
      </Card>

      {/* Results Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <Card key={image.id} className="glass-card overflow-hidden">
              <div className="relative">
                <img src={image.url} alt={image.file.name} className="w-full h-48 object-cover" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() => removeImage(image.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium truncate">{image.file.name}</h4>
                  {image.status === "complete" && (
                    <Badge
                      variant={image.result === "Original" ? "default" : "destructive"}
                      className={cn(
                        "animate-pulse-slow",
                        image.result === "Original" ? "bg-primary" : "bg-destructive"
                      )}
                    >
                      {image.result === "Original" ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 mr-1" />
                      )}
                      {image.result}
                    </Badge>
                  )}
                </div>

                {image.status === "pending" && (
                  <Button
                    onClick={() => analyzeImage(image.id)}
                    className="w-full neon-border hover:neon-glow transition-all duration-300"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Analyze Image
                  </Button>
                )}

                {image.status === "analyzing" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center space-x-2 text-primary">
                      <Zap className="w-4 h-4 animate-pulse" />
                      <span className="text-sm">Analyzing...</span>
                    </div>
                    <Progress value={50} className="h-2" />
                  </div>
                )}

                {image.status === "complete" && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Confidence:</span>
                      <span className="font-medium">{image.confidence}%</span>
                    </div>
                    <Progress
                      value={image.confidence}
                      className={cn("h-2", image.result === "Original" ? "text-primary" : "text-destructive")}
                    />
                  </div>
                )}

                {image.status === "error" && (
                  <p className="text-red-500 text-sm">Detection failed. Please try again.</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
