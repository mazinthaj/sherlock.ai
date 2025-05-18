import { neo4jService } from '../services/neo4jService';
import { mockDataService } from '../services/mockDataService';

/**
 * This utility function seeds the Neo4j database with sample knowledge graph data
 * It's meant to be run manually for testing purposes
 */
export async function seedNeo4jDatabase(useMockData = false): Promise<void> {
    console.log("Starting database seeding process");

    // If using mock data, simply clear and reset the mock data service
    if (useMockData) {
        console.log("Clearing and reseeding mock data");
        try {
            await mockDataService.clearMockData();
            await mockDataService.getKnowledgeGraph(); // This will reset with default mock data
            console.log("Mock database seeded successfully");
            return;
        } catch (error) {
            console.error("Error seeding mock database:", error);
            throw error;
        }
    }

    // Otherwise, seed the Neo4j database
    let session = null;
    try {
        console.log("Getting Neo4j session");
        session = await neo4jService.getSession();

        // Clear previous data
        console.log("Clearing existing data");
        const seedQuery = `
            // Delete all existing data
            MATCH (n)
            DETACH DELETE n;

            // Create entity nodes
            CREATE (trump:Entity {text: 'Donald Trump', type: 'Character'})
            CREATE (biden:Entity {text: 'Joe Biden', type: 'Character'})
            CREATE (us:Entity {text: 'United States', type: 'Location'})
            CREATE (congress:Entity {text: 'Congress', type: 'Organisation'})
            CREATE (whitehouse:Entity {text: 'White House', type: 'Location'})
            CREATE (immigration:Entity {text: 'Immigration', type: 'Topic'})
            CREATE (economy:Entity {text: 'Economy', type: 'Topic'})
            CREATE (president:Entity {text: 'President', type: 'Position'})
            CREATE (supremecourt:Entity {text: 'Supreme Court', type: 'Organisation'})
            CREATE (qatar:Entity {text: 'Qatar', type: 'Location'})
            CREATE (saudiarabia:Entity {text: 'Saudi Arabia', type: 'Location'})
            CREATE (uae:Entity {text: 'United Arab Emirates', type: 'Location'})
            CREATE (cnn:Entity {text: 'CNN', type: 'Organisation'})
            CREATE (foxnews:Entity {text: 'Fox News', type: 'Organisation'})
            CREATE (skynews:Entity {text: 'Sky News', type: 'Organisation'})
            RETURN *;
        `;

        await session.run(seedQuery);
        console.log("Entities created successfully");

        // Create relationships
        console.log("Creating relationships");
        const createRelationsQuery = `
            // Match existing entities to create relationships between them
            MATCH (trump:Entity {text: 'Donald Trump'})
            MATCH (biden:Entity {text: 'Joe Biden'})
            MATCH (us:Entity {text: 'United States'})
            MATCH (congress:Entity {text: 'Congress'})
            MATCH (whitehouse:Entity {text: 'White House'})
            MATCH (immigration:Entity {text: 'Immigration'})
            MATCH (economy:Entity {text: 'Economy'})
            MATCH (president:Entity {text: 'President'})
            MATCH (supremecourt:Entity {text: 'Supreme Court'})
            MATCH (qatar:Entity {text: 'Qatar'})
            MATCH (saudiarabia:Entity {text: 'Saudi Arabia'})
            MATCH (uae:Entity {text: 'United Arab Emirates'})
            MATCH (cnn:Entity {text: 'CNN'})
            MATCH (foxnews:Entity {text: 'Fox News'})
            MATCH (skynews:Entity {text: 'Sky News'})

            // Create relationships
            CREATE (trump)-[:RELATED_TO {type: 'Position'}]->(president)
            CREATE (biden)-[:RELATED_TO {type: 'Position'}]->(president)
            CREATE (trump)-[:RELATED_TO {type: 'Located'}]->(whitehouse)
            CREATE (biden)-[:RELATED_TO {type: 'Located'}]->(whitehouse)
            CREATE (trump)-[:RELATED_TO {type: 'Located'}]->(us)
            CREATE (biden)-[:RELATED_TO {type: 'Located'}]->(us)
            CREATE (trump)-[:RELATED_TO {type: 'Topic'}]->(immigration)
            CREATE (biden)-[:RELATED_TO {type: 'Topic'}]->(economy)
            CREATE (trump)-[:RELATED_TO {type: 'Located'}]->(qatar)
            CREATE (trump)-[:RELATED_TO {type: 'Located'}]->(saudiarabia)
            CREATE (trump)-[:RELATED_TO {type: 'Located'}]->(uae)
            CREATE (congress)-[:RELATED_TO {type: 'Located'}]->(us)
            CREATE (supremecourt)-[:RELATED_TO {type: 'Located'}]->(us)
            CREATE (cnn)-[:RELATED_TO {type: 'Source'}]->(trump)
            CREATE (foxnews)-[:RELATED_TO {type: 'Source'}]->(trump)
            CREATE (skynews)-[:RELATED_TO {type: 'Source'}]->(trump)
            CREATE (cnn)-[:RELATED_TO {type: 'Source'}]->(biden)
            RETURN *;
        `;

        await session.run(createRelationsQuery);
        console.log("Relationships created successfully");

        console.log("Database seeded successfully");
    } catch (error) {
        console.error("Error seeding database:", error);
        if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
        }
        throw error;
    } finally {
        if (session) {
            try {
                console.log("Closing seed database session");
                await session.close();
                console.log("Seed database session closed");
            } catch (closeError) {
                console.error("Error closing seed database session:", closeError);
            }
        }
    }
}

// Utility function to test only the database connection
export async function testNeo4jConnection(): Promise<boolean> {
    console.log("Testing Neo4j connection directly");
    try {
        return await neo4jService.testConnection();
    } catch (error) {
        console.error("Error testing Neo4j connection:", error);
        return false;
    }
}

/**
 * Check if a Neo4j database instance exists (Aura-specific)
 */
export async function checkNeo4jDatabaseStatus(uri: string): Promise<{ active: boolean, message: string }> {
    // Extract the database ID from the URI
    // Format is typically neo4j+s://ID.databases.neo4j.io
    try {
        const uriMatch = uri.match(/neo4j\+s?:\/\/([^\.]+)\.databases\.neo4j\.io/);

        if (!uriMatch || !uriMatch[1]) {
            return {
                active: false,
                message: "Could not determine database ID from URI."
            };
        }

        const dbId = uriMatch[1];
        console.log(`Database ID appears to be: ${dbId}`);

        return {
            active: true,
            message: `Database ID ${dbId} identified. Please verify in Aura Console that this database is active.`
        };
    } catch (error) {
        return {
            active: false,
            message: "Failed to parse database URI."
        };
    }
}

// You can uncomment this line to run the seed function directly from this file
// seedNeo4jDatabase().catch(console.error); 