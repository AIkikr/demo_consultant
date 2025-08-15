"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSearchService = void 0;
class WebSearchService {
    static getInstance() {
        if (!WebSearchService.instance) {
            WebSearchService.instance = new WebSearchService();
        }
        return WebSearchService.instance;
    }
    /**
     * Web検索を実行（Claude環境のWebSearch機能を利用）
     */
    async search(query, maxResults = 5) {
        try {
            console.log(`Performing web search for: ${query}`);
            // Note: この実装では、実際のWebSearch機能が利用可能であることを前提としています
            // 実際の環境では、Claude環境のWebSearch機能やGoogle Search APIなどを使用
            // モックデータを返す（実際の実装では外部APIを呼び出し）
            const mockResults = [
                {
                    title: `${query}に関する最新情報`,
                    url: 'https://example.com/article1',
                    snippet: `${query}についての詳細な解説とトレンド分析。最新の研究結果や市場動向を含む包括的な情報。`,
                    publishedDate: '2025-08-10'
                },
                {
                    title: `${query}の実践的アプローチ`,
                    url: 'https://example.com/article2',
                    snippet: `${query}を実際に活用するための具体的な方法論と成功事例。実践者による詳細なガイド。`,
                    publishedDate: '2025-08-12'
                }
            ];
            return {
                query,
                results: mockResults,
                timestamp: new Date()
            };
        }
        catch (error) {
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
    summarizeResults(searchResponse) {
        if (searchResponse.results.length === 0) {
            return '最新の情報を取得できませんでした。';
        }
        const summaries = searchResponse.results.map((result, index) => `${index + 1}. ${result.title}: ${result.snippet}`).join('\n');
        return `最新情報（${searchResponse.timestamp.toLocaleDateString()}時点）:\n${summaries}`;
    }
    /**
     * 検索が必要かどうかを判定
     */
    shouldPerformSearch(message) {
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
        return searchTriggers.some(trigger => lowerMessage.includes(trigger.toLowerCase()));
    }
}
exports.WebSearchService = WebSearchService;
