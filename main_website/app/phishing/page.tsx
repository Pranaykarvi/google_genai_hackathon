"use client"

import { useState } from "react"
import { UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Shield, Globe, Search, ArrowLeft, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function PhishingDetection() {
  const [url, setUrl] = useState("")
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<{
    isPhishing: boolean
    riskLevel: "Low" | "Medium" | "High"
    score: number
    checks: Array<{ name: string; status: "pass" | "fail" | "warning" }>
  } | null>(null)

  const analyzeUrl = async () => {
    if (!url) return

    setAnalyzing(true)

    // Simulate analysis
    await new Promise((resolve) => setTimeout(resolve, 2500))

    // Mock result
    const isPhishing = Math.random() > 0.7
    const mockResult = {
      isPhishing,
      riskLevel: isPhishing ? "High" : Math.random() > 0.5 ? "Low" : ("Medium" as "Low" | "Medium" | "High"),
      score: isPhishing ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 40) + 10,
      checks: [
        { name: "Domain reputation", status: isPhishing ? "fail" : ("pass" as "pass" | "fail") },
        { name: "SSL certificate", status: Math.random() > 0.3 ? "pass" : ("warning" as "pass" | "warning") },
        { name: "URL structure", status: isPhishing ? "fail" : ("pass" as "pass" | "fail") },
        { name: "Content analysis", status: Math.random() > 0.5 ? "pass" : ("warning" as "pass" | "warning") },
        { name: "Blacklist check", status: isPhishing ? "fail" : ("pass" as "pass" | "fail") },
      ],
    }

    setResult(mockResult)
    setAnalyzing(false)
  }

  const getStatusIcon = (status: "pass" | "fail" | "warning") => {
    switch (status) {
      case "pass":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "fail":
        return <XCircle className="h-4 w-4 text-destructive" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
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
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Globe className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold">Phishing Detection</h2>
          </div>
          <p className="text-muted-foreground">
            Enter a website URL to check for phishing attempts, malicious content, and security threats.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* URL Input Section */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Website Analysis</CardTitle>
              <CardDescription>Enter the full URL of the website you want to check</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url-input">Website URL</Label>
                <Input
                  id="url-input"
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="bg-input border-border"
                />
              </div>

              <Button onClick={analyzeUrl} disabled={!url || analyzing} className="w-full">
                {analyzing ? (
                  <>
                    <Search className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Check Website
                  </>
                )}
              </Button>

              {analyzing && (
                <div className="space-y-2">
                  <Progress value={60} className="w-full" />
                  <p className="text-sm text-muted-foreground text-center">Scanning website for threats...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Security Analysis</CardTitle>
              <CardDescription>Comprehensive security assessment results</CardDescription>
            </CardHeader>
            <CardContent>
              {!result && !analyzing && (
                <div className="text-center py-8 text-muted-foreground">
                  <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Enter a URL to analyze website security</p>
                </div>
              )}

              {result && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    {result.isPhishing ? (
                      <XCircle className="h-8 w-8 text-destructive" />
                    ) : (
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold">
                        {result.isPhishing ? "Phishing Detected" : "Website Appears Safe"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Risk Level: {result.riskLevel} | Threat Score: {result.score}/100
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Security Checks:</h4>
                    {result.checks.map((check, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm">{check.name}</span>
                        {getStatusIcon(check.status)}
                      </div>
                    ))}
                  </div>

                  {result.isPhishing && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <span className="font-medium text-destructive">Security Warning</span>
                      </div>
                      <p className="text-sm text-destructive">
                        This website has been flagged as potentially malicious. Do not enter personal information,
                        passwords, or financial details on this site.
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
            <CardTitle>Phishing Detection Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div>
                <h4 className="font-medium mb-2">Domain Analysis</h4>
                <p className="text-muted-foreground">
                  Checks domain reputation, age, registration details, and known blacklists to identify suspicious
                  websites.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Content Scanning</h4>
                <p className="text-muted-foreground">
                  Analyzes website content, forms, and scripts for common phishing patterns and malicious code
                  injection.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">SSL & Security</h4>
                <p className="text-muted-foreground">
                  Verifies SSL certificates, security headers, and encryption standards to ensure legitimate website
                  security.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
