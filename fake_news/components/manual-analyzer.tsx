'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';

interface AnalysisResult {
  prediction: string;
  confidence: number;
  confidence_score: number;
  confidence_level: string;
  probabilities: { fake: number; real: number };
  analysis_factors: Array<{ factor: string; impact: string; weight: number }>;
  fake_score: number;
  word_count: number;
  processing_time: number;
}

const ManualAnalyzer = () => {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!title.trim() && !text.trim()) {
      setError('Please enter a title or news text to analyze');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), text: text.trim() })
      });

      const data = await response.json();

      if (data.success) {
        setAnalysis(data.analysis);
      } else {
        setError(data.error || 'Failed to analyze text');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setTitle('');
    setText('');
    setAnalysis(null);
    setError('');
  };

  const getPredictionColor = (prediction: string) => {
    switch (prediction) {
      case 'real': return 'bg-green-500';
      case 'fake': return 'bg-red-500';
      case 'uncertain': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getConfidenceLevelColor = (level: string) => {
    switch (level) {
      case 'High': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">🔍 Manual News Analysis</h2>
          <Badge variant="secondary" className="text-xs">AI-Powered Detection</Badge>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              News Headline (Optional)
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter news headline or title..."
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              News Content *
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste or type the news article content here..."
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              {text.length} characters • {text.split(/\s+/).filter(w => w.length > 0).length} words
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={handleAnalyze} disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </>
              ) : (
                '🤖 Analyze News'
              )}
            </Button>
            <Button variant="outline" onClick={handleClear} disabled={loading}>
              Clear
            </Button>
          </div>
        </div>
      </Card>

      {/* Results Section */}
      {analysis && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">📊 Analysis Results</h3>
            <div className="text-xs text-gray-500">
              Processed in {analysis.processing_time}ms
            </div>
          </div>

          {/* Main Prediction */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4 text-center">
              <div className="mb-2">
                <Badge className={`${getPredictionColor(analysis.prediction)} text-white text-lg px-4 py-2`}>
                  {analysis.prediction.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">Prediction</p>
            </Card>

            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {analysis.confidence_score}%
              </div>
              <p className="text-sm text-gray-600">Confidence</p>
              <p className={`text-xs font-medium ${getConfidenceLevelColor(analysis.confidence_level)}`}>
                {analysis.confidence_level} Certainty
              </p>
            </Card>

            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {analysis.word_count}
              </div>
              <p className="text-sm text-gray-600">Words Analyzed</p>
            </Card>
          </div>

          {/* Probability Distribution */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">🎯 Probability Distribution</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-red-700 font-medium">Fake News Probability</span>
                  <span className="font-bold">{Math.round(analysis.probabilities.fake * 100)}%</span>
                </div>
                <Progress value={analysis.probabilities.fake * 100} className="h-3" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-green-700 font-medium">Real News Probability</span>
                  <span className="font-bold">{Math.round(analysis.probabilities.real * 100)}%</span>
                </div>
                <Progress value={analysis.probabilities.real * 100} className="h-3" />
              </div>
            </div>
          </div>

          {/* Analysis Factors */}
          {analysis.analysis_factors && analysis.analysis_factors.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">🔍 Key Analysis Factors</h4>
              <div className="space-y-2">
                {analysis.analysis_factors.map((factor, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{factor.factor}</p>
                      <p className="text-xs text-gray-600 capitalize">
                        {factor.impact.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Weight: {factor.weight.toFixed(2)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technical Details */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-600">Fake Score</p>
                <p className="font-bold text-sm">{analysis.fake_score}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Method</p>
                <p className="font-bold text-sm">Pattern Analysis</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Version</p>
                <p className="font-bold text-sm">v2.0</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Accuracy</p>
                <p className="font-bold text-sm">~85%</p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ManualAnalyzer;