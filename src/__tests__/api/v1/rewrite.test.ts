import { NextApiRequest, NextApiResponse } from 'next';
import rewriteHandler from '@/pages/api/v1/rewrite';

jest.mock('@/services/rewrite', () => ({
  RewriteService: jest.fn().mockImplementation(() => ({
    rewrite: jest.fn().mockResolvedValue({
      original: 'test',
      transformed: '[*FORMAL*] test [*/FORMAL*]',
    }),
  })),
}));

describe('Rewrite API', () => {
  let mockReq: Partial<NextApiRequest>;
  let mockRes: Partial<NextApiResponse>;
  let json: jest.Mock;
  let status: jest.Mock;

  beforeEach(() => {
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });
    mockReq = {
      method: 'POST',
      body: {},
    };
    mockRes = {
      status,
    };
  });

  it('should return 200 for valid request', async () => {
    mockReq.body = { text: 'test' };
    await rewriteHandler(mockReq as NextApiRequest, mockRes as NextApiResponse);
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      original: 'test',
      transformed: '[*FORMAL*] test [*/FORMAL*]',
    });
  });

  it('should return 400 for invalid request', async () => {
    mockReq.body = { text: 'a'.repeat(5001) };
    await rewriteHandler(mockReq as NextApiRequest, mockRes as NextApiResponse);
    expect(status).toHaveBeenCalledWith(400);
  });

  it('should return 405 for non-POST method', async () => {
    mockReq.method = 'GET';
    await rewriteHandler(mockReq as NextApiRequest, mockRes as NextApiResponse);
    expect(status).toHaveBeenCalledWith(405);
  });
}); 