import { WebSearchResult, WebSearchResponse } from '../types';

export class WebSearchService {
  private static instance: WebSearchService;

  static getInstance(): WebSearchService {
    if (!WebSearchService.instance) {
      WebSearchService.instance = new WebSearchService();
    }
    return WebSearchService.instance;
  }

  /**
   * Web検索を実行（Claude環境のWebSearch機能を利用）
   */
  async search(query: string, maxResults: number = 5): Promise<WebSearchResponse> {
    try {
      console.log(`Performing web search for: ${query}`);
      
      // 実際のWebSearch機能を使用する場合のコード
      // Claude環境でWebSearch機能が利用可能な場合
      /*
      const searchResults = await WebSearch({
        query: query,
        allowed_domains: ['wikipedia.org', 'github.com', 'stackoverflow.com'],
        blocked_domains: ['facebook.com', 'twitter.com']
      });
      
      const results: WebSearchResult[] = searchResults.map(result => ({
        title: result.title,
        url: result.url,
        snippet: result.snippet,
        publishedDate: result.publishedDate
      }));
      */
      
      // デモ用のモックデータ（実際の実装では上記のWebSearch機能を使用）
      const mockResults: WebSearchResult[] = [
        {
          title: `${query}に関する最新情報 - 2025年版`,
          url: 'https://example.com/latest-info',
          snippet: `${query}についての2025年最新の動向とトレンド。業界エキスパートによる詳細な分析と将来予測を含む。`,
          publishedDate: '2025-08-14'
        },
        {
          title: `${query}の実践ガイド - 専門家が解説`,
          url: 'https://example.com/practical-guide', 
          snippet: `${query}を効果的に活用するための実践的なアプローチ。成功事例とベストプラクティスを交えた包括的なガイド。`,
          publishedDate: '2025-08-13'
        },
        {
          title: `${query}の最新研究と市場動向`,
          url: 'https://example.com/market-trends',
          snippet: `${query}に関する最新の学術研究と市場分析。データドリブンな洞察と今後の展望について。`,
          publishedDate: '2025-08-12'
        }
      ];

      return {
        query,
        results: mockResults.slice(0, maxResults),
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Web search failed:', error);
      
      // 検索失敗時は空の結果を返す
      return {
        query,
        results: [],
        timestamp: new Date()
      };
    }
  }

  /**
   * 検索結果を要約
   */
  summarizeResults(searchResponse: WebSearchResponse): string {
    if (searchResponse.results.length === 0) {
      return '最新の情報を取得できませんでした。';
    }

    const summaries = searchResponse.results.map((result, index) => 
      `${index + 1}. ${result.title}: ${result.snippet}`
    ).join('\n');

    return `最新情報（${searchResponse.timestamp.toLocaleDateString()}時点）:\n${summaries}`;
  }

  /**
   * 検索が必要かどうかを判定
   */
  shouldPerformSearch(message: string): boolean {
    const searchTriggers = [
      '最新',
      '現在',
      '今',
      'トレンド',
      '2024',
      '2025',
      '最近',
      '新しい',
      'アップデート',
      '変化',
      '動向'
    ];

    const lowerMessage = message.toLowerCase();
    return searchTriggers.some(trigger => 
      lowerMessage.includes(trigger.toLowerCase())
    );
  }
}