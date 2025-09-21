"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, RefreshCw, Search, TrendingUp, Globe, Clock, Settings } from "lucide-react"
import type { NewsArticle } from "@/app/api/news/route"
import { type ProcessedNewsData, NewsDataProcessor } from "@/lib/data-processor"
import AnalyticsPanel from "./analytics-panel"

export default function NewsDashboard() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [processedData, setProcessedData] = useState<ProcessedNewsData[]>([])
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [stats, setStats] = useState({
    total: 0,
    sources: 0,
    categories: 0,
    lastFetch: "",
  })

  const fetchNews = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/news?category=${category}&limit=20`)
      const data = await response.json()

      if (data.status === "success") {
        setArticles(data.articles)
        // Process articles for enhanced metadata
        const processed = NewsDataProcessor.batchProcess(data.articles)
        setProcessedData(processed)
        updateStats(data.articles)
      }
    } catch (error) {
      console.error("Error fetching news:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateStats = (articles: NewsArticle[]) => {
    const sources = new Set(articles.map((a) => a.source.name)).size
    const categories = new Set(articles.map((a) => a.category)).size

    setStats({
      total: articles.length,
      sources,
      categories,
      lastFetch: new Date().toLocaleString(),
    })
  }

  const exportToCSV = async () => {
    try {
      const response = await fetch("/api/export/csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articles, processedData }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `news_headlines_enhanced_${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Error exporting CSV:", error)
    }
  }

  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  useEffect(() => {
    fetchNews()
  }, [category])

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "negative":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  const getViralityColor = (score: number) => {
    if (score > 0.7) return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
    if (score > 0.4) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">NewsCollector</h1>
              <p className="text-muted-foreground">AI-Ready News Data Collection System</p>
            </div>
            <Button onClick={exportToCSV} className="gap-2">
              <Download className="h-4 w-4" />
              Export Enhanced CSV
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">With enhanced metadata</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">News Sources</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.sources}</div>
              <p className="text-xs text-muted-foreground">Reliability scored</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Badge variant="outline">{stats.categories}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.categories}</div>
              <p className="text-xs text-muted-foreground">Topic classified</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">{stats.lastFetch}</div>
              <p className="text-xs text-muted-foreground">Auto-processed</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="articles" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="articles">Articles</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="articles" className="space-y-6">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search headlines..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="environment">Environment</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="politics">Politics</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={fetchNews} disabled={loading} className="gap-2">
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            {/* Enhanced Articles Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredArticles.map((article, index) => {
                const processed = processedData[index]
                return (
                  <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={article.urlToImage || "/placeholder.svg"}
                        alt={article.title}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">{article.category}</Badge>
                        <Badge className={getSentimentColor(article.sentiment)}>{article.sentiment}</Badge>
                      </div>
                      <CardTitle className="text-lg leading-tight text-balance">{article.title}</CardTitle>
                      <CardDescription className="text-sm text-pretty">{article.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{article.source.name}</span>
                          <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                        </div>

                        {processed && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span>Readability</span>
                              <Badge variant="outline">{Math.round(processed.metadata.readabilityScore * 100)}%</Badge>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span>Engagement</span>
                              <Badge variant="outline">{Math.round(processed.metadata.engagementScore * 100)}%</Badge>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span>Virality</span>
                              <Badge className={getViralityColor(processed.metadata.viralityPrediction)}>
                                {processed.metadata.viralityPrediction > 0.7
                                  ? "High"
                                  : processed.metadata.viralityPrediction > 0.4
                                    ? "Medium"
                                    : "Low"}
                              </Badge>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{article.wordCount} words</span>
                          <span>{article.readingTime} min read</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsPanel />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Data Collection Settings
                </CardTitle>
                <CardDescription>
                  Configure your news collection parameters for optimal AI training data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">API Configuration</h3>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">News API Key</label>
                      <Input placeholder="Enter your News API key" type="password" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Fetch Interval (minutes)</label>
                      <Select defaultValue="60">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="180">3 hours</SelectItem>
                          <SelectItem value="360">6 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Data Processing</h3>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sentiment Analysis</label>
                      <Select defaultValue="enabled">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="enabled">Enabled</SelectItem>
                          <SelectItem value="disabled">Disabled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Keyword Extraction</label>
                      <Select defaultValue="10">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">Top 5 keywords</SelectItem>
                          <SelectItem value="10">Top 10 keywords</SelectItem>
                          <SelectItem value="15">Top 15 keywords</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button className="w-full">Save Configuration</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
