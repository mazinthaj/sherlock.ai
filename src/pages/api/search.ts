import type { NextApiRequest, NextApiResponse } from 'next';
import { genaiService } from '../../services/genaiService';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { query } = req.body;

        if (!query || typeof query !== 'string') {
            return res.status(400).json({ message: 'Invalid query parameter' });
        }

        // Process the query using the knowledge graph service
        const graphData = await genaiService.processTextToKnowledgeGraph(query);

        // Return the knowledge graph data
        return res.status(200).json(graphData);
    } catch (error) {
        console.error('Search API error:', error);
        return res.status(500).json({
            message: 'Error processing search query',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
} 