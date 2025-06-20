# SHERLOCK.ai

A powerful knowledge graph visualization tool developed during the Al Jazeera Hackathon. This application allows users to explore, search, and visualize complex relationships between entities in an interactive graph interface.

## Features

### Database Connection
- Neo4j database integration with real-time connection testing
- Automatic fallback to mock data when database is unavailable
- Troubleshooting tools for connection diagnostics
- Visual connection status indicators

### Knowledge Graph Visualization
- Interactive, force-directed graph layout using vis.js
- Color-coded nodes representing different entity types (Characters, Locations, Organizations, etc.)
- Directional arrows showing relationships between entities
- Node filtering options to focus on connected entities
- Auto-stabilization for optimal viewing

### Search Capabilities
- Real-time semantic search across the knowledge graph
- Cypher query language integration for powerful Neo4j searches
- Exact and fuzzy matching algorithms
- Context-aware results showing related entities and connections
- Visual feedback during search operations

### Entity Details
- Detailed information panels for selected entities
- Comprehensive view of entity relationships
- Connected entities exploration
- Quick navigation between related nodes

## Tech Stack

- **Frontend**:
  - React 19
  - Material UI 7
  - vis.js for graph visualization
  - TypeScript for type safety

- **Backend**:
  - Express server
  - Gemini API key
  - SerpApi to retrieve news
  - Neo4j database
  - Cypher query language for graph searches

## Installation

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Neo4j database instance (optional, falls back to mock data)

### Setup

1. Clone the repository:
```bash
https://github.com/mazinthaj/sherlock.ai.git
cd sherlock.ai
```

2. Install dependencies:
```bash
npm install
```

3. Environment Configuration
The application uses environment variables for configuration. Create a .env file with the following variables:
```bash
# Neo4j Credentials
VITE_NEO4J_URI=neo4j+s://your-database-id.databases.neo4j.io
VITE_NEO4J_URI_SSC=neo4j+ssc://your-database-id.databases.neo4j.io
VITE_NEO4J_URI_UNENCRYPTED=neo4j://your-database-id.databases.neo4j.io
VITE_NEO4J_USERNAME=your_username
VITE_NEO4J_PASSWORD=your_password

# Gemini API
VITE_GEMINI_API_KEY=your_gemini_api_key
```

4. Start the development servers:
```bash
npm run dev
```

This will start both the Vite development server and the API server concurrently.

## Usage

1. Navigate to `http://localhost:5173` (or the port shown in your terminal)
2. Click "Test Connection" to verify Neo4j database connectivity
3. Use the search field to find entities in the knowledge graph
4. Click on nodes to view detailed entity information
5. Use the filter toggle to focus on connected nodes only
6. Click "Refresh Graph" to reset the visualization

## Screenshots

![image](https://github.com/user-attachments/assets/3aedda6a-d595-4754-806c-c30393908e4e)


![image](https://github.com/user-attachments/assets/8ccdc1c7-af3f-4766-982b-d745d4e4324b)


![image](https://github.com/user-attachments/assets/98cfa593-b236-4137-bb39-5a25116b07e8)



## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

