import { RewriteService } from '@/services/rewrite';
import { MockLLMAdapter, createLLMAdapter } from '@/adapters/llm';
import { getCacheService, CacheService } from '@/services/cache';
import { RewriteResponse } from '@/types';

// Mock LLM Adapter
jest.mock('@/adapters/llm', () => ({
  createLLMAdapter: jest.fn(),
  MockLLMAdapter: jest.fn().mockImplementation(() => {
    return {
      rewriteText: jest.fn().mockImplementation(async (text, style) => {
        // Simple mock implementation for LLM
        switch (style) {
          case 'pirate': return `[*PIRATE*] ${text} [*/PIRATE*]`;
          case 'haiku': return `[*HAIKU*]\n${text}\n[*/HAIKU*]`;
          default: return `[*FORMAL*] ${text} [*/FORMAL*]`;
        }
      })
    };
  })
}));

// Mock Cache Service
const mockCacheGet = jest.fn();
const mockCacheSet = jest.fn();
const mockCacheGenerateKey = jest.fn((prefix, ...args) => `${prefix}:${args.join('|')}:mockhash`); // Simple key generation for testing

jest.mock('@/services/cache', () => ({
  getCacheService: jest.fn(() => ({
    get: mockCacheGet,
    set: mockCacheSet,
    generateKey: mockCacheGenerateKey
  }) as CacheService)
}));

const mockedCreateLLMAdapter = createLLMAdapter as jest.MockedFunction<typeof createLLMAdapter>;

describe('RewriteService with Cache Abstraction', () => {
  let service: RewriteService;
  let mockAdapterInstance: MockLLMAdapter;

  beforeEach(() => {
    // Reset mocks
    mockCacheGet.mockClear();
    mockCacheSet.mockClear();
    mockCacheGenerateKey.mockClear();
    (getCacheService as jest.Mock).mockClear();
    
    // Setup LLM mock
    mockAdapterInstance = new MockLLMAdapter();
    mockedCreateLLMAdapter.mockClear();
    mockedCreateLLMAdapter.mockReturnValue(mockAdapterInstance);
    // Spy on the rewriteText method of the *instance* returned by the factory mock
    jest.spyOn(mockAdapterInstance, 'rewriteText');
    
    // Ensure CacheService mock is active for this test suite
    (getCacheService as jest.Mock).mockReturnValue({
      get: mockCacheGet,
      set: mockCacheSet,
      generateKey: mockCacheGenerateKey
    });

    // Instantiate the service *after* mocks are set up
    service = new RewriteService();
  });

  it('should call LLM and cache result on cache miss', async () => {
    const request = { text: 'Cache this', style: 'pirate' as const };
    const expectedLLMResult = { original: 'Cache this', transformed: '[*PIRATE*] Cache this [*/PIRATE*]' };
    const generatedKey = 'rewrite:Cache this|pirate:mockhash';

    // Simulate cache miss
    mockCacheGet.mockResolvedValue(null);
    // Ensure LLM mock returns expected value
    (mockAdapterInstance.rewriteText as jest.Mock).mockResolvedValue(expectedLLMResult.transformed);

    const result = await service.rewrite(request);

    expect(result).toEqual(expectedLLMResult);
    expect(mockCacheGenerateKey).toHaveBeenCalledWith('rewrite', request.text, request.style);
    expect(mockCacheGet).toHaveBeenCalledWith(generatedKey);
    expect(mockAdapterInstance.rewriteText).toHaveBeenCalledTimes(1);
    expect(mockAdapterInstance.rewriteText).toHaveBeenCalledWith(request.text, request.style);
    expect(mockCacheSet).toHaveBeenCalledTimes(1);
    expect(mockCacheSet).toHaveBeenCalledWith(generatedKey, expectedLLMResult);
  });

  it('should return cached result on cache hit and not call LLM', async () => {
    const request = { text: 'Cache this', style: 'pirate' as const };
    const cachedData: RewriteResponse = { original: 'Cache this', transformed: '[*PIRATE*] Cached version [*/PIRATE*]' };
    const generatedKey = 'rewrite:Cache this|pirate:mockhash';

    // Simulate cache hit
    mockCacheGet.mockResolvedValue(cachedData);

    const result = await service.rewrite(request);

    expect(result).toEqual(cachedData);
    expect(mockCacheGenerateKey).toHaveBeenCalledWith('rewrite', request.text, request.style);
    expect(mockCacheGet).toHaveBeenCalledWith(generatedKey);
    expect(mockAdapterInstance.rewriteText).not.toHaveBeenCalled();
    expect(mockCacheSet).not.toHaveBeenCalled();
  });

  it('should still call LLM if CacheService GET fails (returns null)', async () => {
    const request = { text: 'Cache fails', style: 'formal' as const };
    const expectedLLMResult = { original: 'Cache fails', transformed: '[*FORMAL*] Cache fails [*/FORMAL*]' };
    const generatedKey = 'rewrite:Cache fails|formal:mockhash';

    // Simulate CacheService GET failing (returning null)
    mockCacheGet.mockResolvedValue(null);
    // Ensure LLM mock returns expected value
    (mockAdapterInstance.rewriteText as jest.Mock).mockResolvedValue(expectedLLMResult.transformed);

    const result = await service.rewrite(request);

    expect(result).toEqual(expectedLLMResult);
    expect(mockCacheGenerateKey).toHaveBeenCalledWith('rewrite', request.text, request.style);
    expect(mockCacheGet).toHaveBeenCalledWith(generatedKey);
    expect(mockAdapterInstance.rewriteText).toHaveBeenCalledTimes(1);
    expect(mockCacheSet).toHaveBeenCalledTimes(1); // Set should still be attempted
    expect(mockCacheSet).toHaveBeenCalledWith(generatedKey, expectedLLMResult);
  });
  
  // Existing test for text length validation
   it('should reject text exceeding maximum length without checking cache or calling LLM', async () => {
    const longText = 'a'.repeat(5001);
    await expect(service.rewrite({ text: longText })).rejects.toThrow(
      'Text exceeds maximum length of 5000 characters'
    );
    expect(mockCacheGenerateKey).not.toHaveBeenCalled();
    expect(mockCacheGet).not.toHaveBeenCalled();
    expect(mockAdapterInstance.rewriteText).not.toHaveBeenCalled();
    expect(mockCacheSet).not.toHaveBeenCalled();
  });

}); 