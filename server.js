import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { neo4jService } from './src/services/neo4jService.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Sample data
let dataSources = [
    {
        id: 1,
        name: 'Twitter Feed',
        type: 'twitter',
        url: 'https://api.twitter.com/v2/tweets',
        lastUpdated: '2023-05-10T08:30:00Z'
    },
    {
        id: 2,
        name: 'News API',
        type: 'news',
        url: 'https://newsapi.org/v2/top-headlines',
        lastUpdated: '2023-05-11T10:15:00Z'
    }
];

// Sample knowledge graph data for search results (used as fallback)
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
app.post('/api/search', async (req, res) => {
    try {
        const { query } = req.body;

        if (!query || typeof query !== 'string') {
            return res.status(400).json({ message: 'Invalid query parameter' });
        }

        console.log('Processing search query:', query);

        try {
            // First check if Neo4j connection is available
            const isConnected = await neo4jService.testConnection();

            if (!isConnected) {
                console.log('Neo4j connection failed, using mock data');
                const mockData = getMockKnowledgeGraph(query);
                return res.status(200).json(mockData);
            }

            // Use Neo4j search if connected
            console.log('Using Neo4j search for query:', query);
            const graphData = await neo4jService.searchKnowledgeGraph(query);

            if (graphData.entities.length === 0) {
                console.log('No results found in Neo4j, using mock data');
                const mockData = getMockKnowledgeGraph(query);
                return res.status(200).json(mockData);
            }

            res.status(200).json(graphData);
        } catch (dbError) {
            console.error('Neo4j search error:', dbError);
            console.log('Falling back to mock data due to error');
            // Fall back to mock data if Neo4j search fails
            const mockData = getMockKnowledgeGraph(query);
            res.status(200).json(mockData);
        }
    } catch (error) {
        console.error('Search API error:', error);
        res.status(500).json({
            message: 'Error processing search query',
            error: error.message || 'Unknown error'
        });
    }
});

// GET all data sources
app.get('/api/data-sources', (req, res) => {
    res.json(dataSources);
});

// GET single data source by ID
app.get('/api/data-sources/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const dataSource = dataSources.find(source => source.id === id);

    if (!dataSource) {
        return res.status(404).json({ message: 'Data source not found' });
    }

    res.json(dataSource);
});

// POST create new data source
app.post('/api/data-sources', (req, res) => {
    const { name, type, url } = req.body;

    if (!name || !type || !url) {
        return res.status(400).json({ message: 'Please provide name, type, and url' });
    }

    const newDataSource = {
        id: dataSources.length + 1,
        name,
        type,
        url,
        lastUpdated: new Date().toISOString()
    };

    dataSources.push(newDataSource);
    res.status(201).json(newDataSource);
});

// PUT update data source
app.put('/api/data-sources/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const dataSourceIndex = dataSources.findIndex(source => source.id === id);

    if (dataSourceIndex === -1) {
        return res.status(404).json({ message: 'Data source not found' });
    }

    const updatedDataSource = {
        ...dataSources[dataSourceIndex],
        ...req.body,
        lastUpdated: new Date().toISOString()
    };

    dataSources[dataSourceIndex] = updatedDataSource;
    res.json(updatedDataSource);
});

// DELETE data source
app.delete('/api/data-sources/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const initialLength = dataSources.length;

    dataSources = dataSources.filter(source => source.id !== id);

    if (dataSources.length === initialLength) {
        return res.status(404).json({ message: 'Data source not found' });
    }

    res.json({ message: 'Data source deleted successfully' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 