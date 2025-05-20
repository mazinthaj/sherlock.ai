import neo4j, { Driver, Session } from 'neo4j-driver';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Using the Neo4j credentials from environment variables
const NEO4J_URI = process.env.VITE_NEO4J_URI;
const NEO4J_USERNAME = process.env.VITE_NEO4J_USERNAME;
const NEO4J_PASSWORD = process.env.VITE_NEO4J_PASSWORD;

// Debug environment variables
console.log('Environment Variables:', {
    NEO4J_URI: NEO4J_URI ? 'Set' : 'Not Set',
    NEO4J_USERNAME: NEO4J_USERNAME ? 'Set' : 'Not Set',
    NEO4J_PASSWORD: NEO4J_PASSWORD ? 'Set' : 'Not Set'
});

if (!NEO4J_URI || !NEO4J_USERNAME || !NEO4J_PASSWORD) {
    console.error('Missing required Neo4j environment variables. Please check your .env file.');
}

// Types for our knowledge graph data
export type EntityType = string;

export interface Entity {
    id: string;
    text: string;
    type: EntityType;
    properties?: Record<string, any>;
}

export interface RelationType {
    id: string;
    source: string;
    target: string;
    type: string;
    properties?: Record<string, any>;
}

export interface KnowledgeGraph {
    entities: Entity[];
    relations: RelationType[];
}

class Neo4jService {
    private driver: Driver | null = null;
    private isInitialized = false;

    constructor() {
        if (!NEO4J_URI || !NEO4J_USERNAME || !NEO4J_PASSWORD) {
            console.error('Cannot initialize Neo4j driver: Missing environment variables');
            return;
        }
        this.initializeDriver();
    }

    private initializeDriver() {
        try {
            if (!NEO4J_URI) {
                throw new Error('NEO4J_URI is not defined');
            }
            if (!NEO4J_USERNAME) {
                throw new Error('NEO4J_USERNAME is not defined');
            }
            if (!NEO4J_PASSWORD) {
                throw new Error('NEO4J_PASSWORD is not defined');
            }

            console.log("Initializing Neo4j driver with URI:", NEO4J_URI);
            this.driver = neo4j.driver(
                NEO4J_URI,
                neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD),
                {
                    // Connection pool configuration
                    maxConnectionLifetime: 3 * 60 * 60 * 1000, // 3 hours
                    maxConnectionPoolSize: 50,
                    connectionAcquisitionTimeout: 30000, // 30 seconds
                    connectionLivenessCheckTimeout: 30000, // 30 seconds
                    connectionTimeout: 30000, // 30 seconds

                    // Data conversion
                    disableLosslessIntegers: true, // Use JavaScript numbers instead of the Integer class

                    // Remove encryption/trust settings since they're in the URI with neo4j+s://

                    // Enhanced logging
                    logging: {
                        level: 'debug', // Set to 'info' in production
                        logger: (level, message) => {
                            console.log(`[Neo4j ${level}] ${message}`);
                        }
                    }
                }
            );
            this.isInitialized = true;
            console.log("Neo4j driver initialized successfully");
        } catch (error) {
            console.error("Failed to initialize Neo4j driver:", error);
            this.isInitialized = false;
            this.driver = null;
        }
    }

    async getSession(): Promise<Session> {
        if (!this.driver) {
            console.log("Driver not initialized, attempting to reinitialize");
            this.initializeDriver();

            if (!this.driver) {
                throw new Error("Failed to initialize Neo4j driver");
            }
        }

        try {
            console.log("Creating new Neo4j session");
            return this.driver.session();
        } catch (error) {
            console.error("Failed to create Neo4j session:", error);
            throw error;
        }
    }

    async close(): Promise<void> {
        if (this.driver) {
            try {
                console.log("Closing Neo4j driver");
                await this.driver.close();
                this.driver = null;
                this.isInitialized = false;
            } catch (error) {
                console.error("Error closing Neo4j driver:", error);
            }
        }
    }

    async testConnection(): Promise<boolean> {
        console.log("Testing Neo4j connection");

        if (!this.isInitialized) {
            console.log("Driver not initialized during connection test, attempting to reinitialize");
            this.initializeDriver();
        }

        if (!this.driver) {
            console.error("Driver initialization failed");
            return false;
        }

        let session: Session | null = null;

        try {
            session = await this.getSession();
            console.log("Session created, running test query");

            const result = await session.run('RETURN 1 AS num');
            console.log("Test query result:", result.records[0].get('num'));

            return true;
        } catch (error) {
            console.error("Neo4j connection test failed with error:", error);
            if (error instanceof Error) {
                console.error("Error message:", error.message);
                console.error("Error stack:", error.stack);
            }
            return false;
        } finally {
            if (session) {
                try {
                    await session.close();
                    console.log("Test session closed");
                } catch (closeError) {
                    console.error("Error closing test session:", closeError);
                }
            }
        }
    }

    async getKnowledgeGraph(): Promise<KnowledgeGraph> {
        console.log("Fetching knowledge graph");
        const session = await this.getSession();
        try {
            // First get all entities
            console.log("Fetching entities");
            const entitiesResult = await session.run(`
                MATCH (e:Entity)
                RETURN e.text AS text, e.type AS type, id(e) AS id
            `);

            const entities: Entity[] = entitiesResult.records.map(record => ({
                id: record.get('id').toString(),
                text: record.get('text') || 'No Label',
                type: record.get('type'),
                properties: {}
            }));

            console.log(`Found ${entities.length} entities`);

            // Then get all relationships
            console.log("Fetching relationships");
            const relationsResult = await session.run(`
                MATCH (source:Entity)-[r:RELATED_TO]->(target:Entity)
                RETURN id(r) AS id, id(source) AS sourceId, id(target) AS targetId, r.type AS type
            `);

            const relations: RelationType[] = relationsResult.records.map(record => ({
                id: record.get('id').toString(),
                source: record.get('sourceId').toString(),
                target: record.get('targetId').toString(),
                type: record.get('type'),
                properties: {}
            }));

            console.log(`Found ${relations.length} relationships`);

            return { entities, relations };
        } catch (error) {
            console.error("Failed to fetch knowledge graph data:", error);
            throw error;
        } finally {
            await session.close();
        }
    }

    async searchKnowledgeGraph(query: string): Promise<KnowledgeGraph> {
        console.log(`Searching knowledge graph for: "${query}"`);
        const session = await this.getSession();
        try {
            // First find entities matching the search query
            console.log("Executing Cypher search query");
            const searchQuery = `
                MATCH (e:Entity)
                WHERE toLower(e.text) CONTAINS toLower($searchTerm)
                OR ANY(keyword IN e.keywords WHERE toLower(keyword) CONTAINS toLower($searchTerm))
                RETURN e.text AS text, e.type AS type, id(e) AS id
            `;

            const entitiesResult = await session.run(searchQuery, { searchTerm: query });

            // If no direct matches, try fuzzy matching
            let entities: Entity[] = [];
            if (entitiesResult.records.length === 0) {
                console.log("No exact matches, trying fuzzy matching");
                // Use APOC if available, otherwise simplified matching
                const fuzzyQuery = `
                    MATCH (e:Entity)
                    WHERE apoc.text.fuzzyMatch(toLower(e.text), toLower($searchTerm))
                    OR ANY(keyword IN e.keywords WHERE apoc.text.fuzzyMatch(toLower(keyword), toLower($searchTerm)))
                    RETURN e.text AS text, e.type AS type, id(e) AS id
                    LIMIT 10
                `;

                try {
                    const fuzzyResult = await session.run(fuzzyQuery, { searchTerm: query });
                    entities = fuzzyResult.records.map(record => ({
                        id: record.get('id').toString(),
                        text: record.get('text') || 'No Label',
                        type: record.get('type'),
                        properties: {}
                    }));
                } catch (fuzzyError) {
                    console.log("Fuzzy matching not available, using basic search");
                    // If APOC not available, fall back to very basic fuzzy approach
                    const basicFuzzyQuery = `
                        MATCH (e:Entity)
                        WITH e, toLower(e.text) AS lowerText, toLower($searchTerm) AS lowerTerm
                        WHERE 
                            lowerText CONTAINS lowerTerm
                            OR lowerTerm CONTAINS lowerText
                            OR any(part IN split(lowerTerm, ' ') WHERE lowerText CONTAINS part)
                        RETURN e.text AS text, e.type AS type, id(e) AS id
                        LIMIT 10
                    `;

                    const basicResult = await session.run(basicFuzzyQuery, { searchTerm: query });
                    entities = basicResult.records.map(record => ({
                        id: record.get('id').toString(),
                        text: record.get('text') || 'No Label',
                        type: record.get('type'),
                        properties: {}
                    }));
                }
            } else {
                entities = entitiesResult.records.map(record => ({
                    id: record.get('id').toString(),
                    text: record.get('text') || 'No Label',
                    type: record.get('type'),
                    properties: {}
                }));
            }

            console.log(`Found ${entities.length} matching entities`);

            if (entities.length === 0) {
                // If still no matches, return empty result
                return { entities: [], relations: [] };
            }

            // Get relationships for these entities and their direct neighbors
            const entityIds = entities.map(e => e.id);
            console.log("Fetching relationships for matched entities");

            // Get 1-degree connections for all matched entities
            const relationsQuery = `
                MATCH (source:Entity)-[r:RELATED_TO]->(target:Entity)
                WHERE id(source) IN $entityIds OR id(target) IN $entityIds
                RETURN id(r) AS id, id(source) AS sourceId, id(target) AS targetId, r.type AS type,
                       source.text AS sourceText, source.type AS sourceType,
                       target.text AS targetText, target.type AS targetType
            `;

            const relationsResult = await session.run(relationsQuery, {
                entityIds: entityIds.map(id => parseInt(id))
            });

            // We need to ensure we have all the entities mentioned in relationships
            const relatedEntityMap = new Map<string, Entity>();

            // Add the entities we already found
            entities.forEach(entity => relatedEntityMap.set(entity.id, entity));

            // Process relations and collect additional entities
            const relations: RelationType[] = relationsResult.records.map(record => {
                const sourceId = record.get('sourceId').toString();
                const targetId = record.get('targetId').toString();

                // Add source entity if not already present
                if (!relatedEntityMap.has(sourceId)) {
                    relatedEntityMap.set(sourceId, {
                        id: sourceId,
                        text: record.get('sourceText') || 'No Label',
                        type: record.get('sourceType'),
                        properties: {}
                    });
                }

                // Add target entity if not already present
                if (!relatedEntityMap.has(targetId)) {
                    relatedEntityMap.set(targetId, {
                        id: targetId,
                        text: record.get('targetText') || 'No Label',
                        type: record.get('targetType'),
                        properties: {}
                    });
                }

                // Return the relation
                return {
                    id: record.get('id').toString(),
                    source: sourceId,
                    target: targetId,
                    type: record.get('type'),
                    properties: {}
                };
            });

            console.log(`Found ${relations.length} relationships`);

            // Convert the entity map back to an array
            const allEntities = Array.from(relatedEntityMap.values());

            return {
                entities: allEntities,
                relations
            };
        } catch (error) {
            console.error("Failed to search knowledge graph:", error);
            throw error;
        } finally {
            await session.close();
        }
    }
}

export const neo4jService = new Neo4jService(); 