const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Sample knowledge graph data for search results
const getMockKnowledgeGraph = (query) => {
    // Create mock entities and relations that would appear to be relevant to the search query
    const entities = [
        { id: '101', text: `${query} (Search Term)`, type: 'Topic' },
        { id: '102', text: 'Donald Trump', type: 'Character' },
        { id: '103', text: 'Joe Biden', type: 'Character' },
        { id: '104', text: 'United States', type: 'Location' },
        { id: '105', text: 'White House', type: 'Location' },
        { id: '106', text: query.includes('News') ? 'CNN' : 'Fox News', type: 'Organisation' }
    ];

    const relations = [
        { id: 'r101', source: '101', target: '102', type: 'Mentioned', properties: {} },
        { id: 'r102', source: '101', target: '103', type: 'Mentioned', properties: {} },
        { id: 'r103', source: '102', target: '104', type: 'Located', properties: {} },
        { id: 'r104', source: '103', target: '104', type: 'Located', properties: {} },
        { id: 'r105', source: '102', target: '105', type: 'Located', properties: {} },
        { id: 'r106', source: '106', target: '101', type: 'Reports', properties: {} }
    ];

    return { entities, relations };
};

// POST search endpoint
app.post('/api/search', (req, res) => {
    try {
        const { query } = req.body;

        if (!query || typeof query !== 'string') {
            return res.status(400).json({ message: 'Invalid query parameter' });
        }

        console.log('Processing search query:', query);

        // Return mock knowledge graph data based on the query
        const graphData = getMockKnowledgeGraph(query);

        // Add a small delay to simulate processing time
        setTimeout(() => {
            res.status(200).json(graphData);
        }, 500);
    } catch (error) {
        console.error('Search API error:', error);
        res.status(500).json({
            message: 'Error processing search query',
            error: error.message || 'Unknown error'
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
}); 