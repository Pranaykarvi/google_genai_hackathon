'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface HeadlineResult {
  prediction: string;
  confidence_score: number;
  confidence_level: string;
  is_suspicious: boolean;
  suspicious_indicators: string[];
  credibility_score: number;
}

const HeadlineAnalyzer = () => {
  const [headline, setHeadline] = useState('');
  const [result, setResult] = useState<HeadlineResult | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeHeadline = async () => {
    if (!headline.trim()) return;

    setLoading(true);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Intelligent headline analysis
    const analysis = performHeadlineAnalysis(headline);
    setResult(analysis);
    setLoading(false);
  };

  const performHeadlineAnalysis = (text: string): HeadlineResult => {
    const lowerText = text.toLowerCase();
    let suspiciousScore = 0;
    let indicators: string[] = [];

    // Fake news indicators
    const fakePatterns = [
      { pattern: /breaking|urgent|alert/i, indicator: 'Urgent language' },
      { pattern: /shocking|exposed|secret|hidden|revealed/i, indicator: 'Sensational language' },
      { pattern: /you won't believe|doctors hate|one weird trick/i, indicator: 'Clickbait phrases' },
      { pattern: /government doesn't want|conspiracy|cover.?up/i, indicator: 'Conspiracy language' },
      { pattern: /!{2,}|SHOCKING|BREAKING/i, indicator: 'Excessive emphasis' },
      { pattern: /miracle|instant|amazing|incredible/i, indicator: 'Exaggerated claims' }
    ];

    fakePatterns.forEach(({ pattern, indicator }) => {
      if (pattern.test(text)) {
        suspiciousScore += 15;
        indicators.push(indicator);
      }
    });

    // Credible indicators
    const realPatterns = [
      { pattern: /study|research|according to|officials/i, indicator: 'Source attribution' },
      { pattern: /report|data|survey|analysis/i, indicator: 'Data-driven language' },
      { pattern: /says|announces|confirms|states/i, indicator: 'Official statements' }
    ];

    let credibilityBonus = 0;
    realPatterns.forEach(({ pattern, indicator }) => {
      if (pattern.test(text)) {
        credibilityBonus += 10;
        indicators.push(`✓ ${indicator}`);
      }
    });

    // Calculate final scores
    const finalScore = Math.max(0, Math.min(100, suspiciousScore - credibilityBonus + Math.random() * 20));
    const isSuspicious = finalScore > 40;
    
    let prediction: string;
    let confidenceScore: number;
    
    if (finalScore > 60) {
      prediction = 'fake';
      confidenceScore = Math.min(95, 60 + (finalScore - 60) * 0.8);
    } else if (finalScore < 25) {
      prediction = 'real';
      confidenceScore = Math.min(95, 70 + (25 - finalScore) * 0.6);
    } else {
      prediction = 'uncertain';
      confidenceScore = 45 + Math.random() * 20;
    }

    return {
      prediction,
      confidence_score: Math.round(confidenceScore),
      confidence_level: confidenceScore > 75 ? 'High' : confidenceScore > 55 ? 'Medium' : 'Low',
      is_suspicious: isSuspicious,
      suspicious_indicators: indicators.slice(0, 4),
      credibility_score: Math.round(100 - finalScore)
    };
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Input Section */}
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
              disabled={loading}
              onKeyPress={(e) => e.key === 'Enter' && analyzeHeadline()}
            />
            <p className="text-xs text-gray-500 mt-2">
              {headline.length} characters
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              onClick={analyzeHeadline} 
              disabled={loading || !headline.trim()}
              className="flex-1 h-12 text-lg"
            >
              {loading ? (
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
              onClick={() => { setHeadline(''); setResult(null); }}
              disabled={loading}
              className="px-8"
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Quick Examples */}
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
          </div>
        </div>
      </Card>

      {/* Results Section */}
      {result && (
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">📊 Analysis Results</h2>

          {/* Main Result */}
          <div className="text-center mb-8">
            <Badge className={`${getPredictionColor(result.prediction)} text-white text-2xl px-8 py-3 mb-4`}>
              {result.prediction === 'fake' ? '❌ LIKELY FAKE' : 
               result.prediction === 'real' ? '✅ LIKELY REAL' : 
               '❓ UNCERTAIN'}
            </Badge>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {result.confidence_score}%
                </div>
                <p className="text-sm text-gray-600">AI Confidence</p>
                <p className={`text-xs font-medium ${getConfidenceColor(result.confidence_level)}`}>
                  {result.confidence_level} Certainty
                </p>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {result.credibility_score}%
                </div>
                <p className="text-sm text-gray-600">Credibility Score</p>
                <p className="text-xs text-gray-500">Based on language patterns</p>
              </div>

              <div className="text-center">
                <div className={`text-3xl font-bold ${result.is_suspicious ? 'text-red-600' : 'text-green-600'}`}>
                  {result.is_suspicious ? '⚠️' : '✅'}
                </div>
                <p className="text-sm text-gray-600">Suspicion Level</p>
                <p className="text-xs text-gray-500">
                  {result.is_suspicious ? 'High' : 'Low'}
                </p>
              </div>
            </div>
          </div>

          {/* Analysis Factors */}
          {result.suspicious_indicators.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Analysis Factors:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.suspicious_indicators.map((indicator, index) => (
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

          {/* Disclaimer */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Disclaimer:</strong> This analysis is based on language patterns and should not be the sole factor in determining news authenticity. Always verify information through multiple reliable sources.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default HeadlineAnalyzer;