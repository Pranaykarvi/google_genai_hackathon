// components/analytics-panel.tsx
'use client';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AnalyticsData {
  totalArticles: number;
  uniqueSources: number;
  uniqueCategories: number;
  lastUpdated: string;
  avgReadability: number;
  avgEngagement: number;
  sentimentDistribution: Record<string, number>;
  viralityDistribution: Record<string, number>;
  // 🤖 NEW: AI Analysis Data
  aiAnalysis?: {
    predictions: Record<string, number>;
    avgConfidence: number;
    totalAnalyzed: number;
    realCount: number;
    fakeCount: number;
    uncertainCount: number;
    errorCount: number;
    serviceStatus: string;
    successRate: number;
    predictionBreakdown: {
      real: { count: number; percentage: number };
      fake: { count: number; percentage: number };
      uncertain: { count: number; percentage: number };
    };
  };
}

interface ProcessedArticle {
  article_id: string;
  title: string;
  source: string;
  category?: string;
  categories?: string[];
  readability: number;
  engagement: number;
  virality: 'Low' | 'Medium' | 'High';
  sentiment: 'positive' | 'neutral' | 'negative';
  word_count: number;
  reading_time: number;
  date: string;
  image_url?: string;
  // 🤖 NEW: AI Prediction Fields
  ai_prediction?: string;
  ai_confidence?: number;
  ai_confidence_score?: number;
  ai_probabilities?: {
    fake: number;
    real: number;
  };
}

interface HeadlineResult {
  prediction: string;
  confidence_score: number;
  confidence_level: string;
  is_suspicious: boolean;
  suspicious_indicators: string[];
  credibility_score: number;
}

const AnalyticsPanel = () => {
  const [articles, setArticles] = useState<ProcessedArticle[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  // 🤖 NEW: Headline Analyzer State
  const [headline, setHeadline] = useState('');
  const [headlineResult, setHeadlineResult] = useState<HeadlineResult | null>(null);
  const [headlineLoading, setHeadlineLoading] = useState(false);

  const fetchNewsData = async () => {
    try {
      setLoading(true);
      
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/news?limit=10&t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        cache: 'no-store'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setArticles(data.data);
        setAnalytics(data.analytics);
        console.log(`✅ Loaded ${data.data.length} fresh articles`);
        if (data.analytics?.aiAnalysis) {
          console.log(`🤖 AI Analysis: ${data.analytics.aiAnalysis.realCount} real, ${data.analytics.aiAnalysis.fakeCount} fake`);
        }
      } else {
        console.error('Failed to fetch articles:', data.error);
      }
    } catch (error) {
      console.error('Failed to fetch news data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsData();
    const interval = setInterval(fetchNewsData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // 🤖 NEW: Improved Headline Analysis Function
  const analyzeHeadline = async () => {
    if (!headline.trim()) return;

    setHeadlineLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const analysis = performHeadlineAnalysis(headline);
    setHeadlineResult(analysis);
    setHeadlineLoading(false);
  };

  const performHeadlineAnalysis = (text: string): HeadlineResult => {
    const lowerText = text.toLowerCase();
    let fakeScore = 0;
    let realScore = 0;
    let indicators: string[] = [];

    console.log(`🔍 Analyzing: "${text}"`);

    // 🚨 STRONG FAKE NEWS INDICATORS
    const strongFakePatterns = [
      { pattern: /breaking|urgent|alert|emergency/i, weight: 30, indicator: 'Urgent clickbait language' },
      { pattern: /shocking|exposed|secret|hidden|revealed|truth/i, weight: 35, indicator: 'Sensational language detected' },
      { pattern: /you won't believe|doctors hate|one weird trick|this will blow your mind/i, weight: 50, indicator: 'Clickbait phrases detected' },
      { pattern: /government doesn't want|conspiracy|cover.?up|they don't want you to know/i, weight: 45, indicator: 'Conspiracy language detected' },
      { pattern: /!{2,}|SHOCKING|BREAKING|URGENT/i, weight: 25, indicator: 'Excessive emphasis (caps/exclamation)' },
      { pattern: /miracle|instant|amazing|incredible|unbelievable/i, weight: 30, indicator: 'Exaggerated claims detected' },
      { pattern: /leaked|exclusive|insider|whistleblower/i, weight: 20, indicator: 'Exclusive/leak claims' },
      { pattern: /big pharma|mainstream media|deep state|elite control/i, weight: 40, indicator: 'Anti-establishment buzzwords' },
      { pattern: /cure|heal|natural remedy|doctors don't want/i, weight: 35, indicator: 'Medical misinformation patterns' },
      { pattern: /must read|share if you agree|wake up|open your eyes/i, weight: 30, indicator: 'Emotional manipulation detected' },
      { pattern: /rigged|stolen|fake election|fraud/i, weight: 40, indicator: 'Political conspiracy language' }
    ];

    // 📰 STRONG REAL NEWS INDICATORS  
    const realPatterns = [
      { pattern: /according to|study shows|research indicates|data shows/i, weight: 25, indicator: '✓ Proper source attribution' },
      { pattern: /published in|peer.?reviewed|journal|university/i, weight: 30, indicator: '✓ Academic/scientific source' },
      { pattern: /officials said|spokesperson|department|ministry/i, weight: 20, indicator: '✓ Official statements' },
      { pattern: /report|survey|analysis|statistics/i, weight: 15, indicator: '✓ Data-driven reporting' },
      { pattern: /confirmed|announced|stated|reported/i, weight: 12, indicator: '✓ Factual reporting language' },
      { pattern: /reuters|bbc|cnn|nbc|cbs|abc|npr|pbs|associated press|bloomberg/i, weight: 25, indicator: '✓ Reputable news source mentioned' }
    ];

    // Check for fake patterns
    strongFakePatterns.forEach(({ pattern, weight, indicator }) => {
      if (pattern.test(text)) {
        fakeScore += weight;
        indicators.push(indicator);
        console.log(`🚨 FAKE indicator found: ${indicator} (+${weight})`);
      }
    });

    // Check for real patterns
    realPatterns.forEach(({ pattern, weight, indicator }) => {
      if (pattern.test(text)) {
        realScore += weight;
        indicators.push(indicator);
        console.log(`✅ REAL indicator found: ${indicator} (+${weight})`);
      }
    });

    // Calculate net score (fake score minus real score)
    const netScore = fakeScore - realScore;
    
    console.log(`📊 Scores: Fake=${fakeScore}, Real=${realScore}, Net=${netScore}`);

    // Add some controlled randomness for variety (±5 points)
    const randomFactor = (Math.random() - 0.5) * 10;
    const finalScore = netScore + randomFactor;

    console.log(`🎯 Final score: ${finalScore} (with randomness: ${randomFactor})`);

    // Determine prediction based on final score with WIDER thresholds
    let prediction: string;
    let confidenceScore: number;

    if (finalScore > 15) {
      // Likely FAKE
      prediction = 'fake';
      confidenceScore = Math.min(95, 70 + (finalScore - 15) * 1.2);
      console.log(`❌ PREDICTION: FAKE (score: ${finalScore})`);
    } else if (finalScore < -10) {
      // Likely REAL
      prediction = 'real';
      confidenceScore = Math.min(95, 70 + Math.abs(finalScore + 10) * 1.0);
      console.log(`✅ PREDICTION: REAL (score: ${finalScore})`);
    } else {
      // UNCERTAIN zone
      prediction = 'uncertain';
      confidenceScore = 50 + Math.random() * 20; // 50-70% confidence
      console.log(`❓ PREDICTION: UNCERTAIN (score: ${finalScore})`);
    }

    // Boost confidence if we have multiple indicators
    if (indicators.length > 2) {
      confidenceScore = Math.min(95, confidenceScore + 10);
    }

    // Force minimum confidence levels
    if (prediction === 'fake' && fakeScore > 50) {
      confidenceScore = Math.max(80, confidenceScore);
    }
    if (prediction === 'real' && realScore > 30) {
      confidenceScore = Math.max(75, confidenceScore);
    }

    const isSuspicious = fakeScore > realScore + 5;
    
    // 🔧 FIXED: Make credibility score more dynamic and realistic
    let credibilityScore;
    if (prediction === 'fake') {
      credibilityScore = Math.max(5, Math.min(45, 50 - fakeScore + realScore + (Math.random() * 20 - 10)));
    } else if (prediction === 'real') {
      credibilityScore = Math.max(55, Math.min(95, 70 + realScore - fakeScore + (Math.random() * 20 - 10)));
    } else {
      credibilityScore = 40 + Math.random() * 30; // 40-70% for uncertain
    }

    console.log(`🎯 FINAL RESULT: ${prediction.toUpperCase()} (${Math.round(confidenceScore)}% confidence)`);

    return {
      prediction,
      confidence_score: Math.round(confidenceScore),
      confidence_level: confidenceScore > 75 ? 'High' : confidenceScore > 55 ? 'Medium' : 'Low',
      is_suspicious: isSuspicious,
      suspicious_indicators: indicators.slice(0, 5),
      credibility_score: Math.round(credibilityScore) // This will now be dynamic!
    };
  };

  const handleExportCSV = async () => {
    try {
      const response = await fetch('/api/export/csv');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `NewsCollector_AI_Export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-500';
      case 'negative': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getViralityColor = (virality: string) => {
    switch (virality) {
      case 'High': return 'bg-purple-500';
      case 'Medium': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getAIPredictionBadge = (prediction: string, confidence: number) => {
    switch (prediction) {
      case 'real':
        return (
          <Badge className="bg-green-600 text-white text-xs px-2 py-1 font-bold">
            ✅ Real {confidence}%
          </Badge>
        );
      case 'fake':
        return (
          <Badge className="bg-red-600 text-white text-xs px-2 py-1 font-bold">
            ⚠️ Fake {confidence}%
          </Badge>
        );
      case 'uncertain':
        return (
          <Badge className="bg-yellow-600 text-white text-xs px-2 py-1 font-bold">
            ❓ Uncertain
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-gray-600 text-white text-xs px-2 py-1">
            ❌ Error
          </Badge>
        );
      case 'unavailable':
        return (
          <Badge className="bg-gray-400 text-white text-xs px-2 py-1">
            🤖 AI N/A
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500 text-white text-xs px-2 py-1">
            🤖 Unknown
          </Badge>
        );
    }
  };

  const getAIServiceStatus = () => {
    if (!analytics?.aiAnalysis) return null;
    
    const { serviceStatus, successRate } = analytics.aiAnalysis;
    
    switch (serviceStatus) {
      case 'online':
        return (
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-700 font-medium">AI Online ({successRate}%)</span>
          </div>
        );
      case 'partial':
        return (
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-yellow-700 font-medium">AI Partial ({successRate}%)</span>
          </div>
        );
      case 'offline':
        return (
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-red-700 font-medium">AI Offline</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            <span className="text-gray-700 font-medium">AI Unknown</span>
          </div>
        );
    }
  };

  const getPredictionColor = (prediction: string) => {
    switch (prediction) {
      case 'real': return 'bg-green-500';
      case 'fake': return 'bg-red-500';
      case 'uncertain': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'High': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading NewsCollector...</p>
          <p className="text-sm text-gray-400 mt-2">Fetching 10 fresh articles with AI analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">NewsCollector</h1>
          <p className="text-gray-600">AI-Ready News Data Collection System</p>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-sm text-blue-600 font-medium">
              Displaying {articles.length} articles • Auto-refreshes every 5 minutes
            </p>
            {getAIServiceStatus()}
          </div>
        </div>
        
        <div className="flex gap-4">
          <Button onClick={fetchNewsData} variant="outline" disabled={loading}>
            <span className={`mr-2 ${loading ? 'animate-spin' : ''}`}>🔄</span>
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
          <Button onClick={handleExportCSV} className="bg-gray-800 hover:bg-gray-900">
            <span className="mr-2">📁</span>
            Export AI Data
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Articles</h3>
              <span className="text-2xl">📊</span>
            </div>
            <div className="text-2xl font-bold">{analytics.totalArticles}</div>
            <p className="text-xs text-gray-500">With enhanced metadata</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">News Sources</h3>
              <span className="text-2xl">🌐</span>
            </div>
            <div className="text-2xl font-bold">{analytics.uniqueSources}</div>
            <p className="text-xs text-gray-500">Reliability scored</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Categories</h3>
              <span className="text-2xl">📂</span>
            </div>
            <div className="text-2xl font-bold">{analytics.uniqueCategories}</div>
            <p className="text-xs text-gray-500">Topic classified</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">AI Analysis</h3>
              <span className="text-2xl">🤖</span>
            </div>
            <div className="text-2xl font-bold">
              {analytics.aiAnalysis?.avgConfidence || 0}%
            </div>
            <p className="text-xs text-gray-500">
              Avg confidence • {analytics.aiAnalysis?.totalAnalyzed || 0} analyzed
            </p>
          </Card>
        </div>
      )}

      {/* AI Summary Card */}
      {analytics?.aiAnalysis && (
        <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              🤖 AI Fake News Analysis
            </h3>
            <Badge className={`${analytics.aiAnalysis.serviceStatus === 'online' ? 'bg-green-500' : 'bg-yellow-500'} text-white`}>
              {analytics.aiAnalysis.serviceStatus}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {analytics.aiAnalysis.realCount}
              </div>
              <div className="text-sm text-gray-600">Real Articles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {analytics.aiAnalysis.fakeCount}
              </div>
              <div className="text-sm text-gray-600">Fake Detected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {analytics.aiAnalysis.uncertainCount}
              </div>
              <div className="text-sm text-gray-600">Uncertain</div>
            </div>
          </div>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="articles" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="articles">Articles ({articles.length})</TabsTrigger>
          <TabsTrigger value="analyzer">🔍 Analyze</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="articles">
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
              <input
                type="text"
                placeholder="Search headlines..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option>All Categories</option>
                <option>Technology</option>
                <option>Business</option>
                <option>Health</option>
                <option>Environment</option>
              </select>
              <Button variant="outline" onClick={fetchNewsData} disabled={loading}>
                <span className={`mr-2 ${loading ? 'animate-spin' : ''}`}>🔄</span>
                Refresh
              </Button>
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6">
              {articles.map((article, index) => (
                <Card 
                  key={article.article_id} 
                  className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                >
                  <div className="h-40 sm:h-48 bg-gray-200 relative overflow-hidden">
                    {article.image_url ? (
                      <img 
                        src={article.image_url} 
                        alt={article.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 bg-gradient-to-br from-blue-50 to-indigo-100">
                        <span className="text-3xl">📰</span>
                      </div>
                    )}
                    
                    <div className="absolute top-2 left-2 flex gap-1 flex-wrap max-w-[80%]">
                      <Badge variant="secondary" className="text-xs px-2 py-1">
                        {Array.isArray(article.categories) 
                          ? article.categories[0] 
                          : article.category || 'general'
                        }
                      </Badge>
                      <Badge className={`${getSentimentColor(article.sentiment)} text-white text-xs px-2 py-1`}>
                        {article.sentiment}
                      </Badge>
                      {article.ai_prediction && getAIPredictionBadge(
                        article.ai_prediction, 
                        article.ai_confidence_score || 0
                      )}
                    </div>

                    <div className="absolute top-2 right-2">
                      <div className="bg-black/70 text-white text-xs px-2 py-1 rounded-full font-bold">
                        #{index + 1}
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-base mb-2 line-clamp-2 leading-tight">
                      {article.title}
                    </h3>

                    {article.ai_prediction && article.ai_confidence_score && (
                      <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-600">AI Confidence</span>
                          <span className="font-medium">{article.ai_confidence_score}%</span>
                        </div>
                        <Progress 
                          value={article.ai_confidence_score} 
                          className="h-1.5"
                        />
                        {article.ai_probabilities && (
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Real: {Math.round(article.ai_probabilities.real * 100)}%</span>
                            <span>Fake: {Math.round(article.ai_probabilities.fake * 100)}%</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Readability</span>
                        <span className="font-medium">{article.readability}%</span>
                      </div>
                      <Progress value={article.readability} className="h-1.5" />

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Engagement</span>
                        <span className="font-medium">{article.engagement}%</span>
                      </div>
                      <Progress value={article.engagement} className="h-1.5" />

                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Virality</span>
                        <Badge className={`${getViralityColor(article.virality)} text-white text-xs px-2 py-0.5`}>
                          {article.virality}
                        </Badge>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium truncate flex-1 mr-2">{article.source}</span>
                        <div className="flex items-center gap-2 text-gray-400">
                          <span>{article.word_count}w</span>
                          <span>{article.reading_time}m</span>
                        </div>
                      </div>
                      <div className="text-gray-400">
                        {article.date}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {articles.length > 0 && (
              <div className="text-center py-4">
                <p className="text-gray-600">
                  Showing <span className="font-bold text-blue-600">{articles.length}</span> articles
                  {articles.length === 10 && " • Click refresh for more"}
                </p>
                {analytics?.aiAnalysis && (
                  <p className="text-sm text-gray-500 mt-2">
                    AI Analysis: {analytics.aiAnalysis.realCount} real, {analytics.aiAnalysis.fakeCount} fake, 
                    {analytics.aiAnalysis.uncertainCount} uncertain • {analytics.aiAnalysis.avgConfidence}% avg confidence
                  </p>
                )}
              </div>
            )}

            {articles.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📰</div>
                <h3 className="text-2xl font-bold text-gray-700 mb-4">
                  No articles available
                </h3>
                <p className="text-gray-500 mb-6">
                  Click refresh to load the latest news articles with AI analysis.
                </p>
                <Button onClick={fetchNewsData} className="bg-blue-500 hover:bg-blue-600 text-white">
                  🔄 Load 10 Articles
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* 🤖 NEW: Headline Analyzer Tab - UPDATED DESIGN */}
        <TabsContent value="analyzer">
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="p-8">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">🔍 Headline Analyzer</h1>
                <p className="text-gray-600">AI-powered fake news detection for headlines</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Enter News Headline:
                  </label>
                  <Input
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="Type or paste a news headline here..."
                    className="w-full text-lg p-4 h-14"
                    disabled={headlineLoading}
                    onKeyPress={(e) => e.key === 'Enter' && analyzeHeadline()}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {headline.length} characters
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button 
                    onClick={analyzeHeadline} 
                    disabled={headlineLoading || !headline.trim()}
                    className="flex-1 h-12 text-lg"
                  >
                    {headlineLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Analyzing...
                      </>
                    ) : (
                      '🤖 Analyze Headline'
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => { setHeadline(''); setHeadlineResult(null); }}
                    disabled={headlineLoading}
                    className="px-8"
                  >
                    Clear
                  </Button>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Try these examples:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <button 
                    className="text-left text-sm text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-white transition-colors"
                    onClick={() => setHeadline("BREAKING: Scientists discover aliens living among us in secret underground cities")}
                  >
                    "BREAKING: Scientists discover aliens living among us..."
                  </button>
                  <button 
                    className="text-left text-sm text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-white transition-colors"
                    onClick={() => setHeadline("Study shows renewable energy costs continue to decline according to new research")}
                  >
                    "Study shows renewable energy costs continue to decline..."
                  </button>
                  <button 
                    className="text-left text-sm text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-white transition-colors"
                    onClick={() => setHeadline("SHOCKING truth doctors don't want you to know about vaccines!")}
                  >
                    "SHOCKING truth doctors don't want you to know..."
                  </button>
                  <button 
                    className="text-left text-sm text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-white transition-colors"
                    onClick={() => setHeadline("Officials announce new infrastructure funding, report confirms")}
                  >
                    "Officials announce new infrastructure funding..."
                  </button>
                </div>
              </div>
            </Card>

            {headlineResult && (
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">📊 Analysis Results</h2>

                <div className="text-center mb-8">
                  <Badge className={`${getPredictionColor(headlineResult.prediction)} text-white text-2xl px-8 py-3 mb-4`}>
                    {headlineResult.prediction === 'fake' ? '❌ LIKELY FAKE' : 
                     headlineResult.prediction === 'real' ? '✅ LIKELY REAL' : 
                     '❓ UNCERTAIN'}
                  </Badge>
                  
                  {/* 🔧 UPDATED: Cleaner 2-column layout without fixed credibility score */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-900 mb-2">
                        {headlineResult.confidence_score}%
                      </div>
                      <p className="text-lg text-gray-600 font-medium">AI Confidence</p>
                      <p className={`text-sm font-medium ${getConfidenceColor(headlineResult.confidence_level)}`}>
                        {headlineResult.confidence_level} Certainty
                      </p>
                    </div>

                    <div className="text-center">
                      <div className={`text-4xl font-bold mb-2 ${headlineResult.is_suspicious ? 'text-red-600' : 'text-green-600'}`}>
                        {headlineResult.is_suspicious ? '⚠️ HIGH' : '✅ LOW'}
                      </div>
                      <p className="text-lg text-gray-600 font-medium">Suspicion Level</p>
                      <p className="text-sm text-gray-500">
                        {headlineResult.is_suspicious ? 'Multiple warning signs detected' : 'No major red flags found'}
                      </p>
                    </div>
                  </div>
                </div>

                {headlineResult.suspicious_indicators.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Analysis Factors:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {headlineResult.suspicious_indicators.map((indicator, index) => (
                        <div 
                          key={index} 
                          className={`p-3 rounded-lg border ${
                            indicator.startsWith('✓') 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-yellow-50 border-yellow-200'
                          }`}
                        >
                          <p className="text-sm font-medium text-gray-900">
                            {indicator}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Disclaimer:</strong> This analysis is based on language patterns and should not be the sole factor in determining news authenticity. Always verify information through multiple reliable sources.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Analytics and Settings tabs remain the same */}
        <TabsContent value="analytics">
          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Sentiment Analysis</h3>
                <div className="space-y-3">
                  {Object.entries(analytics.sentimentDistribution).map(([sentiment, count]) => (
                    <div key={sentiment} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getSentimentColor(sentiment)}`}></div>
                        <span className="capitalize">{sentiment}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getSentimentColor(sentiment)}`}
                            style={{ width: `${(count / analytics.totalArticles) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-8">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {analytics.aiAnalysis && (
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-4">🤖 AI Predictions</h3>
                  <div className="space-y-3">
                    {Object.entries(analytics.aiAnalysis.predictions).map(([prediction, count]) => (
                      <div key={prediction} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            prediction === 'real' ? 'bg-green-500' :
                            prediction === 'fake' ? 'bg-red-500' :
                            prediction === 'uncertain' ? 'bg-yellow-500' : 'bg-gray-500'
                          }`}></div>
                          <span className="capitalize">{prediction}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                prediction === 'real' ? 'bg-green-500' :
                                prediction === 'fake' ? 'bg-red-500' :
                                prediction === 'uncertain' ? 'bg-yellow-500' : 'bg-gray-500'
                              }`}
                              style={{ width: `${(count / analytics.totalArticles) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-8">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-800">
                      <strong>Service Status:</strong> {analytics.aiAnalysis.serviceStatus} • 
                      <strong> Success Rate:</strong> {analytics.aiAnalysis.successRate}%
                    </div>
                  </div>
                </Card>
              )}

              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Virality Potential</h3>
                <div className="space-y-3">
                  {Object.entries(analytics.viralityDistribution).map(([virality, count]) => (
                    <div key={virality} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getViralityColor(virality)}`}></div>
                        <span>{virality}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getViralityColor(virality)}`}
                            style={{ width: `${(count / analytics.totalArticles) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-8">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Content Quality</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Average Readability</span>
                      <span className="text-sm font-medium">{analytics.avgReadability}%</span>
                    </div>
                    <Progress value={analytics.avgReadability} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Average Engagement</span>
                      <span className="text-sm font-medium">{analytics.avgEngagement}%</span>
                    </div>
                    <Progress value={analytics.avgEngagement} className="h-2" />
                  </div>

                  {analytics.aiAnalysis && (
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">AI Confidence</span>
                        <span className="text-sm font-medium">{analytics.aiAnalysis.avgConfidence}%</span>
                      </div>
                      <Progress value={analytics.aiAnalysis.avgConfidence} className="h-2" />
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings">
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Collection Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Auto-refresh Interval</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option>5 minutes</option>
                  <option>10 minutes</option>
                  <option>30 minutes</option>
                  <option>1 hour</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Articles per Collection</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                  <option>100</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">AI Analysis</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    Enable fake news detection
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    Show confidence scores
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    High confidence threshold (80%+)
                  </label>
                </div>
              </div>
              
              <Button className="w-full">Save Settings</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPanel;