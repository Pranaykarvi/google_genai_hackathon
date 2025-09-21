import { NextRequest, NextResponse } from 'next/server';
import { NewsDataProcessor } from '@/lib/data-processor';

const API_TOKEN = 'A3eRN9YeuhoZqjf4YSoNqVVPX3koqoBaXfBavSk2';
const BASE_URL = 'https://api.thenewsapi.com/v1/news';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10');
  const forceRefresh = searchParams.get('refresh') === 'true';
  
  try {
    console.log(`🔄 Fetching ${limit} articles...`);
    
    // Fetch articles from multiple sources
    const rawArticles = await fetchNewsFromMultipleSources(limit, forceRefresh);
    
    console.log(`📊 Raw articles fetched: ${rawArticles.length}`);
    
    if (rawArticles.length === 0) {
      console.warn('⚠️ No articles returned from news sources');
      
      // Return mock data if no articles found
      const mockArticles = generateMockArticles(limit);
      console.log(`🎭 Using ${mockArticles.length} mock articles as fallback`);
      
      const analytics = NewsDataProcessor.generateAnalyticsWithAI(mockArticles);
      
      return NextResponse.json({
        success: true,
        data: mockArticles,
        analytics,
        totalResults: mockArticles.length,
        aiAnalysisEnabled: true,
        aiMode: 'mock_fallback',
        processed: true,
        message: 'Using mock data due to API unavailability'
      }, {
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }

    // Process articles with existing metadata
    const processedArticles = rawArticles.map(article => 
      NewsDataProcessor.processArticle(article)
    );

    // 🤖 Add intelligent mock AI predictions
    const articlesWithAI = addIntelligentMockAI(processedArticles);

    // Generate analytics with AI data
    const analytics = NewsDataProcessor.generateAnalyticsWithAI(articlesWithAI);

    console.log(`✅ Processed ${articlesWithAI.length} articles with intelligent AI analysis`);

    return NextResponse.json({
      success: true,
      data: articlesWithAI,
      analytics,
      totalResults: articlesWithAI.length,
      aiAnalysisEnabled: true,
      aiMode: 'intelligent_mock',
      processed: true
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('❌ Error processing news:', error);
    
    // Fallback to mock data on any error
    const mockArticles = generateMockArticles(limit);
    const analytics = NewsDataProcessor.generateAnalyticsWithAI(mockArticles);
    
    return NextResponse.json({
      success: true,
      data: mockArticles,
      analytics,
      totalResults: mockArticles.length,
      aiAnalysisEnabled: true,
      aiMode: 'error_fallback',
      processed: true,
      message: 'Using mock data due to API error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}

// Generate mock articles when API fails
function generateMockArticles(count: number) {
  const mockData = [
    {
      title: "Technology Giants Report Strong Q4 Earnings Despite Market Headwinds",
      url: "https://example.com/tech-earnings-q4",
      source: "TechNews Daily",
      published_at: new Date().toISOString(),
      categories: ["Technology", "Business"],
      description: "Major technology companies exceeded analyst expectations in their fourth quarter reports, signaling resilience in a challenging economic environment.",
      image_url: "https://via.placeholder.com/400x300/3B82F6/ffffff?text=Tech+News",
      snippet: "Technology sector shows strong performance..."
    },
    {
      title: "New Climate Research Shows Promising Results for Carbon Capture Technology",
      url: "https://example.com/climate-research",
      source: "Environmental Science Today",
      published_at: new Date(Date.now() - 3600000).toISOString(),
      categories: ["Environment", "Science"],
      description: "Scientists at leading universities have developed more efficient methods for capturing atmospheric carbon dioxide.",
      image_url: "https://via.placeholder.com/400x300/10B981/ffffff?text=Environment",
      snippet: "Revolutionary carbon capture methods..."
    },
    {
      title: "Healthcare Innovation: AI-Powered Diagnostic Tool Shows 95% Accuracy Rate",
      url: "https://example.com/ai-healthcare",
      source: "Medical Journal Weekly",
      published_at: new Date(Date.now() - 7200000).toISOString(),
      categories: ["Healthcare", "Technology"],
      description: "New artificial intelligence system can detect early-stage diseases with unprecedented accuracy according to clinical trials.",
      image_url: "https://via.placeholder.com/400x300/EF4444/ffffff?text=Healthcare+AI",
      snippet: "AI diagnostics breakthrough..."
    },
    {
      title: "Global Education Initiative Launches to Bridge Digital Learning Gap",
      url: "https://example.com/education-initiative",
      source: "Education World",
      published_at: new Date(Date.now() - 10800000).toISOString(),
      categories: ["Education", "Society"],
      description: "International coalition announces ambitious program to provide digital learning resources to underserved communities worldwide.",
      image_url: "https://via.placeholder.com/400x300/8B5CF6/ffffff?text=Education",
      snippet: "Digital education expansion..."
    },
    {
      title: "Renewable Energy Milestone: Solar Power Costs Drop to Record Lows",
      url: "https://example.com/solar-milestone",
      source: "Energy Report",
      published_at: new Date(Date.now() - 14400000).toISOString(),
      categories: ["Energy", "Environment"],
      description: "Latest industry analysis reveals solar energy production costs have reached historic minimums, accelerating adoption globally.",
      image_url: "https://via.placeholder.com/400x300/F59E0B/ffffff?text=Solar+Energy",
      snippet: "Solar costs plummet worldwide..."
    },
    {
      title: "Space Exploration Update: Mars Mission Preparations Enter Final Phase",
      url: "https://example.com/mars-mission",
      source: "Space Sciences Quarterly",
      published_at: new Date(Date.now() - 18000000).toISOString(),
      categories: ["Science", "Space"],
      description: "International space agencies coordinate final preparations for the next crewed mission to Mars scheduled for 2026.",
      image_url: "https://via.placeholder.com/400x300/DC2626/ffffff?text=Mars+Mission",
      snippet: "Mars mission timeline confirmed..."
    },
    {
      title: "Economic Analysis: Global Markets Show Steady Recovery Trends",
      url: "https://example.com/market-recovery",
      source: "Financial Times Today",
      published_at: new Date(Date.now() - 21600000).toISOString(),
      categories: ["Business", "Economics"],
      description: "Comprehensive market analysis indicates sustained economic growth across major global indices over the past quarter.",
      image_url: "https://via.placeholder.com/400x300/059669/ffffff?text=Market+News",
      snippet: "Markets maintain upward trajectory..."
    },
    {
      title: "Transportation Revolution: Autonomous Vehicle Testing Expands Nationwide",
      url: "https://example.com/autonomous-vehicles",
      source: "Transport Innovation",
      published_at: new Date(Date.now() - 25200000).toISOString(),
      categories: ["Transportation", "Technology"],
      description: "Major automotive manufacturers announce expanded testing programs for self-driving vehicles in metropolitan areas.",
      image_url: "https://via.placeholder.com/400x300/7C3AED/ffffff?text=Auto+Tech",
      snippet: "Autonomous vehicle rollout accelerates..."
    },
    {
      title: "Agricultural Breakthrough: New Crop Varieties Increase Yield by 40%",
      url: "https://example.com/crop-breakthrough",
      source: "Agriculture Today",
      published_at: new Date(Date.now() - 28800000).toISOString(),
      categories: ["Agriculture", "Science"],
      description: "Agricultural researchers develop drought-resistant crop varieties that significantly increase food production capabilities.",
      image_url: "https://via.placeholder.com/400x300/16A34A/ffffff?text=Agriculture",
      snippet: "Crop yields see dramatic improvement..."
    },
    {
      title: "Cultural Heritage Preservation: Digital Archives Project Saves Historical Documents",
      url: "https://example.com/heritage-preservation",
      source: "Cultural Heritage Weekly",
      published_at: new Date(Date.now() - 32400000).toISOString(),
      categories: ["Culture", "Technology"],
      description: "International effort to digitize and preserve historical documents ensures cultural heritage accessibility for future generations.",
      image_url: "https://via.placeholder.com/400x300/DB2777/ffffff?text=Heritage",
      snippet: "Historical preservation goes digital..."
    }
  ];

  return mockData.slice(0, count).map((article, index) => ({
    ...article,
    article_id: `mock_${index + 1}`,
    uuid: `mock-uuid-${index + 1}`
  }));
}

function addIntelligentMockAI(articles) {
  return articles.map((article, index) => {
    const title = (article.title || '').toLowerCase();
    const content = (article.description || article.snippet || '').toLowerCase();
    const source = (article.source || '').toLowerCase();
    const fullText = `${title} ${content}`;

    // 🧠 Intelligent fake news detection based on patterns
    let fakeScore = 0;
    let confidence = 0.7; // Base confidence

    // Suspicious title patterns (increase fake probability)
    const suspiciousPatterns = [
      /breaking|urgent|alert|shocking|exposed|secret|hidden|truth|conspiracy/i,
      /you won't believe|doctors hate|one weird trick|shocking truth/i,
      /government doesn't want|big pharma|hidden agenda/i,
      /!{2,}|CAPITAL LETTERS|amazing discovery/i
    ];

    suspiciousPatterns.forEach(pattern => {
      if (pattern.test(title)) {
        fakeScore += 0.3;
      }
    });

    // Reliable source patterns (decrease fake probability)
    const reliableSources = [
      'reuters', 'associated press', 'bbc', 'cnn', 'bloomberg', 
      'wall street journal', 'new york times', 'washington post',
      'npr', 'pbs', 'abc news', 'cbs news', 'nbc news',
      'technews daily', 'environmental science', 'medical journal',
      'education world', 'energy report', 'financial times'
    ];

    const isReliableSource = reliableSources.some(source_name => 
      source.includes(source_name)
    );

    if (isReliableSource) {
      fakeScore -= 0.4;
      confidence += 0.15;
    }

    // Content analysis
    const factualWords = ['study', 'research', 'data', 'according to', 'reported', 'official', 'confirmed', 'analysis'];
    const sensationalWords = ['incredible', 'unbelievable', 'miracle', 'secret', 'exposed', 'revealed'];

    factualWords.forEach(word => {
      if (fullText.includes(word)) {
        fakeScore -= 0.1;
      }
    });

    sensationalWords.forEach(word => {
      if (fullText.includes(word)) {
        fakeScore += 0.15;
      }
    });

    // Add some randomness for variety
    fakeScore += (Math.random() - 0.5) * 0.3;
    
    // Determine prediction
    const isFake = fakeScore > 0.2;
    const isUncertain = Math.abs(fakeScore) < 0.1;

    let prediction, finalConfidence, probabilities;

    if (isUncertain) {
      prediction = 'uncertain';
      finalConfidence = 0.5 + Math.random() * 0.2;
      probabilities = {
        fake: 0.4 + Math.random() * 0.2,
        real: 0.4 + Math.random() * 0.2
      };
    } else if (isFake) {
      prediction = 'fake';
      finalConfidence = Math.min(0.95, confidence + Math.abs(fakeScore));
      probabilities = {
        fake: finalConfidence,
        real: 1 - finalConfidence
      };
    } else {
      prediction = 'real';
      finalConfidence = Math.min(0.95, confidence + Math.abs(fakeScore));
      probabilities = {
        real: finalConfidence,
        fake: 1 - finalConfidence
      };
    }

    return {
      ...article,
      // AI prediction fields
      ai_prediction: prediction,
      ai_confidence: Math.round(finalConfidence * 1000) / 1000,
      ai_confidence_score: Math.round(finalConfidence * 100),
      ai_probabilities: {
        fake: Math.round(probabilities.fake * 1000) / 1000,
        real: Math.round(probabilities.real * 1000) / 1000
      },
      ai_status: 'analyzed',
      ai_analysis_timestamp: new Date().toISOString(),
      ai_method: 'intelligent_pattern_analysis'
    };
  });
}

async function fetchNewsFromMultipleSources(targetCount: number, forceRefresh: boolean) {
  const strategies = [
    {
      name: 'headlines',
      url: `${BASE_URL}/headlines`,
      params: {
        api_token: API_TOKEN,
        locale: 'us',
        language: 'en',
        limit: '8'
      }
    },
    {
      name: 'all-news',
      url: `${BASE_URL}/all`,
      params: {
        api_token: API_TOKEN,
        language: 'en',
        limit: '8'
      }
    },
    {
      name: 'top-news',
      url: `${BASE_URL}/top`,
      params: {
        api_token: API_TOKEN,
        locale: 'us',
        language: 'en',
        limit: '6'
      }
    }
  ];

  let allArticles = [];

  for (const strategy of strategies) {
    try {
      const params = new URLSearchParams(strategy.params);
      console.log(`📡 Fetching from ${strategy.name}...`);
      
      const response = await fetch(`${strategy.url}?${params}`, {
        method: 'GET',
        headers: {
          'User-Agent': `NewsCollector-${Date.now()}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(12000)
      });

      console.log(`📊 ${strategy.name} response status: ${response.status}`);

      if (response.ok) {
        const data = await response.json();
        if (data.data && Array.isArray(data.data)) {
          console.log(`✅ Got ${data.data.length} articles from ${strategy.name}`);
          allArticles = allArticles.concat(data.data);
        } else {
          console.warn(`⚠️ No data array from ${strategy.name}:`, data);
        }
      } else {
        console.warn(`⚠️ ${strategy.name} failed: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.warn(`Error details: ${errorText}`);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Error with ${strategy.name}:`, error);
    }
  }

  console.log(`📊 Total articles collected: ${allArticles.length}`);

  // Remove duplicates
  const uniqueArticles = allArticles.filter((article, index, self) => {
    if (!article.url) return false;
    return index === self.findIndex(a => a.url === article.url);
  });

  // Shuffle for variety
  return uniqueArticles.sort(() => 0.5 - Math.random()).slice(0, targetCount);
}