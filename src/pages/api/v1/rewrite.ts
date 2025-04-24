import { NextApiRequest, NextApiResponse } from 'next';
import { RewriteRequest } from '@/types';
import { RewriteService } from '@/services/rewrite';
import { z } from 'zod';

const rewriteService = new RewriteService();

const rewriteRequestSchema = z.object({
  text: z.string().max(5000),
  style: z.enum(['pirate', 'haiku', 'formal']).default('formal'),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = rewriteRequestSchema.parse(req.body);
    const result = await rewriteService.rewrite(body as RewriteRequest);
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request body' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
} 