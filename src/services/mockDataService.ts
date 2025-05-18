import { type Entity, type KnowledgeGraph, type EntityType, type RelationType } from './neo4jService';

/**
 * This service provides mock data when the Neo4j database is unavailable
 * It simulates the same data structure that would come from Neo4j
 */
class MockDataService {
    // Mock entities for testing
    private mockEntities: Entity[] = [
        { id: '1', text: 'Donald Trump', type: 'Character' },
        { id: '2', text: 'Joe Biden', type: 'Character' },
        { id: '3', text: 'United States', type: 'Location' },
        { id: '4', text: 'Congress', type: 'Organisation' },
        { id: '5', text: 'White House', type: 'Location' },
        { id: '6', text: 'Immigration', type: 'Topic' },
        { id: '7', text: 'Economy', type: 'Topic' },
        { id: '8', text: 'President', type: 'Position' },
        { id: '9', text: 'Supreme Court', type: 'Organisation' },
        { id: '10', text: 'Qatar', type: 'Location' },
        { id: '11', text: 'Saudi Arabia', type: 'Location' },
        { id: '12', text: 'United Arab Emirates', type: 'Location' },
        { id: '13', text: 'CNN', type: 'Organisation' },
        { id: '14', text: 'Fox News', type: 'Organisation' },
        { id: '15', text: 'Sky News', type: 'Organisation' }
    ];

    // Mock relations for testing
    private mockRelations: RelationType[] = [
        { id: 'r1', source: '1', target: '8', type: 'Position', properties: {} },
        { id: 'r2', source: '2', target: '8', type: 'Position', properties: {} },
        { id: 'r3', source: '1', target: '5', type: 'Located', properties: {} },
        { id: 'r4', source: '2', target: '5', type: 'Located', properties: {} },
        { id: 'r5', source: '1', target: '3', type: 'Located', properties: {} },
        { id: 'r6', source: '2', target: '3', type: 'Located', properties: {} },
        { id: 'r7', source: '1', target: '6', type: 'Topic', properties: {} },
        { id: 'r8', source: '2', target: '7', type: 'Topic', properties: {} },
        { id: 'r9', source: '1', target: '10', type: 'Located', properties: {} },
        { id: 'r10', source: '1', target: '11', type: 'Located', properties: {} },
        { id: 'r11', source: '1', target: '12', type: 'Located', properties: {} },
        { id: 'r12', source: '4', target: '3', type: 'Located', properties: {} },
        { id: 'r13', source: '9', target: '3', type: 'Located', properties: {} },
        { id: 'r14', source: '13', target: '1', type: 'Source', properties: {} },
        { id: 'r15', source: '14', target: '1', type: 'Source', properties: {} },
        { id: 'r16', source: '15', target: '1', type: 'Source', properties: {} },
        { id: 'r17', source: '13', target: '2', type: 'Source', properties: {} }
    ];

    // Return mock data
    async getKnowledgeGraph(): Promise<KnowledgeGraph> {
        return new Promise((resolve) => {
            // Simulate a network delay
            setTimeout(() => {
                resolve({
                    entities: this.mockEntities,
                    relations: this.mockRelations
                });
            }, 500);
        });
    }

    // Add more mock data
    async addMockData(entities: Entity[], relations: RelationType[]): Promise<void> {
        // Assign new IDs to avoid conflicts
        const newEntities = entities.map((entity, index) => ({
            ...entity,
            id: (this.mockEntities.length + index + 1).toString()
        }));

        // Update relation IDs to match new entity IDs
        const entityMap = new Map<string, string>();
        entities.forEach((oldEntity, index) => {
            entityMap.set(oldEntity.id, newEntities[index].id);
        });

        const newRelations = relations.map(relation => {
            const sourceId = entityMap.get(relation.source) || relation.source;
            const targetId = entityMap.get(relation.target) || relation.target;
            return {
                ...relation,
                source: sourceId,
                target: targetId
            };
        });

        // Add to our mock arrays
        this.mockEntities = [...this.mockEntities, ...newEntities];
        this.mockRelations = [...this.mockRelations, ...newRelations];
    }

    // Clear mock data
    async clearMockData(): Promise<void> {
        this.mockEntities = [];
        this.mockRelations = [];
    }
}

export const mockDataService = new MockDataService(); 