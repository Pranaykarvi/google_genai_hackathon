import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Fetch processed articles from your news API
    const newsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/news?limit=100`);
    const newsData = await newsResponse.json();
    
    if (!newsData.success || !newsData.data) {
      throw new Error('Failed to fetch news data');
    }

    const articles = newsData.data;
    
    // Create enhanced CSV with all metadata
    const csvHeaders = [
      'Article_ID',
      'Title',
      'Text_Body',
      'Date',
      'Source',
      'Author',
      'Category',
      'URL',
      'Image_URL',
      'Language',
      'Published_At',
      'Word_Count',
      'Reading_Time_Minutes',
      'Readability_Score',
      'Engagement_Score',
      'Virality_Rating',
      'Sentiment',
      'Reliability_Score',
      'Collection_Timestamp',
      'Keywords',
      'Description'
    ];
    
    const csvRows = articles.map(article => [
      article.article_id,
      `"${(article.title || '').replace(/"/g, '""')}"`,
      `"${(article.text_body || '').replace(/"/g, '""')}"`,
      article.date,
      article.source,
      article.author,
      Array.isArray(article.categories) ? article.categories.join('; ') : article.categories,
      article.url,
      article.image_url,
      article.language,
      article.published_at,
      article.word_count,
      article.reading_time,
      article.readability,
      article.engagement,
      article.virality,
      article.sentiment,
      article.reliability_score,
      article.collection_timestamp,
      article.keywords,
      `"${(article.description || '').replace(/"/g, '""')}"`
    ]);
    
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `NewsCollector_Enhanced_Export_${timestamp}.csv`;
    
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });
    
  } catch (error) {
    console.error('CSV Export Error:', error);
    return NextResponse.json(
      { error: 'Failed to export CSV' },
      { status: 500 }
    );
  }
}