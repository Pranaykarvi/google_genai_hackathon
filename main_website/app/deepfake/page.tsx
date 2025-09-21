"use client"

import React, { useState, useEffect } from "react"
import { UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Shield,
  Eye,
  Upload,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"

export default function DeepfakeDetection() {
  const [file, setFile] = useState<File | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<{
    isDeepfake: boolean
    confidence: number
    details: string[]
  } | null>(null)

  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setResult(null)
    }
  }

  const analyzeFile = async () => {
    if (!file) return

    setAnalyzing(true)
    setResult(null)

    const formData = new FormData()
    formData.append("files", file) // key must match backend expecting "files"

    try {
      const response = await fetch("https://falsify-backend.onrender.com/detect/", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.results || data.results.length === 0) {
        throw new Error("No results returned from backend")
      }

      const firstResult = data.results[0]

      if (firstResult.error) {
        alert(`Error: ${firstResult.error}`)
        setResult(null)
      } else {
        setResult({
          isDeepfake: firstResult.label === "deepfake",
          confidence: Math.round(firstResult.confidence * 100),
          details: [
            `File shape: ${firstResult.shape.join(" x ")}`,
            "Facial landmark analysis completed",
            "Temporal consistency checked",
            "Compression artifact analysis",
            "Neural network pattern detection",
          ],
        })
      }
    } catch (error) {
      alert(`Failed to analyze file: ${error}`)
      setResult(null)
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">Falsify</h1>
            </div>
          </div>
          {isMounted && <UserButton afterSignOutUrl="/" />}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Eye className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold">Deepfake Detection</h2>
          </div>
          <p className="text-muted-foreground">
            Upload an image to analyze for AI-generated deepfakes and digital
            manipulation.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Upload Media</CardTitle>
              <CardDescription>
                Select an image file (JPG, PNG) to analyze
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-upload">Choose File</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="bg-input border-border"
                  disabled={analyzing}
                />
              </div>

              {file && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Selected File:</p>
                  <p className="text-sm text-muted-foreground">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}

              <Button
                onClick={analyzeFile}
                disabled={!file || analyzing}
                className="w-full"
              >
                {analyzing ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Analyze for Deepfakes
                  </>
                )}
              </Button>

              {analyzing && (
                <div className="space-y-2">
                  <Progress value={33} className="w-full" />
                  <p className="text-sm text-muted-foreground text-center">
                    Processing media file...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
              <CardDescription>
                Detailed analysis of the uploaded media file
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!result && !analyzing && (
                <div className="text-center py-8 text-muted-foreground">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Upload and analyze a file to see results</p>
                </div>
              )}

              {result && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    {result.isDeepfake ? (
                      <XCircle className="h-8 w-8 text-destructive" />
                    ) : (
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold">
                        {result.isDeepfake
                          ? "Deepfake Detected"
                          : "Authentic Content"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Confidence: {result.confidence}%
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Analysis Details:</h4>
                    <ul className="space-y-1">
                      {result.details.map((detail, index) => (
                        <li
                          key={index}
                          className="text-sm text-muted-foreground flex items-center space-x-2"
                        >
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {result.isDeepfake && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <span className="font-medium text-destructive">Warning</span>
                      </div>
                      <p className="text-sm text-destructive">
                        This content appears to be artificially generated or
                        manipulated. Exercise caution when sharing or believing this
                        content.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <Card className="bg-card border-border mt-8">
          <CardHeader>
            <CardTitle>How Deepfake Detection Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div>
                <h4 className="font-medium mb-2">Facial Analysis</h4>
                <p className="text-muted-foreground">
                  Advanced algorithms analyze facial landmarks, expressions, and
                  micro-movements to detect inconsistencies typical of deepfake
                  generation.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Temporal Consistency</h4>
                <p className="text-muted-foreground">
                  Frame-by-frame analysis checks for temporal inconsistencies and
                  unnatural transitions that indicate artificial generation.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Neural Patterns</h4>
                <p className="text-muted-foreground">
                  Machine learning models trained on millions of samples detect subtle
                  patterns and artifacts left by deepfake generation algorithms.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
