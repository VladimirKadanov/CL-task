import { RewriteRequest, RewriteResponse, RewriteStyle } from '@/types';
import { createLLMAdapter } from '@/adapters/llm';
import { getCacheService } from '@/services/cache';

const MAX_TEXT_LENGTH = 5000;

export class RewriteService {
  private llmAdapter = createLLMAdapter();
  private cacheService = getCacheService(); // Get CacheService instance

  async rewrite(request: RewriteRequest): Promise<RewriteResponse> {
    // 1. Validate input
    if (request.text.length > MAX_TEXT_LENGTH) {
      throw new Error(`Text exceeds maximum length of ${MAX_TEXT_LENGTH} characters`);
    }

    const style: RewriteStyle = request.style || 'formal';
    const cacheKey = this.cacheService.generateKey('rewrite', request.text, style);

    // 2. Check cache
    const cachedResult = await this.cacheService.get<RewriteResponse>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // 3. Call LLM on cache miss
    const transformed = await this.llmAdapter.rewriteText(request.text, style);

    const result: RewriteResponse = {
      original: request.text,
      transformed,
    };

    // 4. Store result in cache (fire and forget, don't await)
    this.cacheService.set(cacheKey, result);

    return result;
  }
} 