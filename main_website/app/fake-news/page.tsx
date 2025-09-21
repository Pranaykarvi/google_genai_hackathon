"use client"

import { useState } from "react"
import { UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, FileText, Search, ArrowLeft, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function FakeNewsDetection() {
  const [url, setUrl] = useState("")
  const [text, setText] = useState("")
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<{
    isFakeNews: boolean
    credibilityScore: number
    biasLevel: "Low" | "Medium" | "High"
    factors: Array<{ name: string; score: number; description: string }>
  } | null>(null)

  const analyzeContent = async (content: string, isUrl: boolean) => {
    if (!content) return

    setAnalyzing(true)

    // Simulate analysis
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Mock result
    const isFake = Math.random() > 0.6
    const mockResult = {
      isFakeNews: isFake,
      credibilityScore: isFake ? Math.floor(Math.random() * 40) + 10 : Math.floor(Math.random() * 30) + 70,
      biasLevel: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)] as "Low" | "Medium" | "High",
      factors: [
        {
          name: "Source Credibility",
          score: Math.floor(Math.random() * 100),
          description: "Reputation and track record of the news source",
        },
        {
          name: "Fact Verification",
          score: Math.floor(Math.random() * 100),
          description: "Cross-reference with verified facts and sources",
        },
        {
          name: "Language Analysis",
          score: Math.floor(Math.random() * 100),
          description: "Emotional language, sensationalism, and bias indicators",
        },
        {
          name: "Citation Quality",
          score: Math.floor(Math.random() * 100),
          description: "Quality and reliability of cited sources and references",
        },
      ],
    }

    setResult(mockResult)
    setAnalyzing(false)
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
            <FileText className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold">Fake News Detection</h2>
          </div>
          <p className="text-muted-foreground">
            Analyze news articles and text content to verify authenticity, detect bias, and assess credibility.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Content Analysis</CardTitle>
              <CardDescription>Enter a news article URL or paste the text content directly</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="url" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="url">Article URL</TabsTrigger>
                  <TabsTrigger value="text">Text Content</TabsTrigger>
                </TabsList>

                <TabsContent value="url" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="url-input">News Article URL</Label>
                    <Input
                      id="url-input"
                      type="url"
                      placeholder="https://news-website.com/article"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="bg-input border-border"
                    />
                  </div>
                  <Button onClick={() => analyzeContent(url, true)} disabled={!url || analyzing} className="w-full">
                    {analyzing ? (
                      <>
                        <Search className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Analyze Article
                      </>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="text" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="text-input">Article Text</Label>
                    <Textarea
                      id="text-input"
                      placeholder="Paste the news article text here..."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="bg-input border-border min-h-[120px]"
                    />
                  </div>
                  <Button onClick={() => analyzeContent(text, false)} disabled={!text || analyzing} className="w-full">
                    {analyzing ? (
                      <>
                        <FileText className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Analyze Text
                      </>
                    )}
                  </Button>
                </TabsContent>
              </Tabs>

              {analyzing && (
                <div className="space-y-2 mt-4">
                  <Progress value={45} className="w-full" />
                  <p className="text-sm text-muted-foreground text-center">Analyzing content credibility...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Credibility Assessment</CardTitle>
              <CardDescription>Detailed analysis of content authenticity and bias</CardDescription>
            </CardHeader>
            <CardContent>
              {!result && !analyzing && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Analyze content to see credibility results</p>
                </div>
              )}

              {result && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    {result.isFakeNews ? (
                      <XCircle className="h-8 w-8 text-destructive" />
                    ) : (
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold">
                        {result.isFakeNews ? "Potentially False Information" : "Content Appears Credible"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Credibility: {result.credibilityScore}% | Bias Level: {result.biasLevel}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Analysis Factors:</h4>
                    {result.factors.map((factor, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{factor.name}</span>
                          <span className="text-sm text-muted-foreground">{factor.score}%</span>
                        </div>
                        <Progress value={factor.score} className="w-full h-2" />
                        <p className="text-xs text-muted-foreground">{factor.description}</p>
                      </div>
                    ))}
                  </div>

                  {result.isFakeNews && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <span className="font-medium text-destructive">Credibility Warning</span>
                      </div>
                      <p className="text-sm text-destructive">
                        This content shows signs of misinformation or bias. Verify information through multiple reliable
                        sources before sharing or believing.
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
            <CardTitle>How Fake News Detection Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div>
                <h4 className="font-medium mb-2">Source Verification</h4>
                <p className="text-muted-foreground">
                  Analyzes the credibility and track record of news sources, checking against databases of reliable and
                  unreliable publishers.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Content Analysis</h4>
                <p className="text-muted-foreground">
                  Uses natural language processing to detect emotional language, sensationalism, and patterns common in
                  misinformation.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Fact Checking</h4>
                <p className="text-muted-foreground">
                  Cross-references claims with verified facts and authoritative sources to identify potential
                  inaccuracies or fabrications.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
