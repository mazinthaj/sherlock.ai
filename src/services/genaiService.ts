import type { KnowledgeGraph, Entity, RelationType } from './neo4jService';

// Configuration
const GEMINI_API_KEY = 'AIzaSyCBNCn-QvKJM3zvZ60YcufHci91FvtCzsw';

interface GeminiEntity {
    type: string;
    value: string;
}

interface GeminiRelationship {
    source: string;
    target: string;
    relationship: string;
}

interface GeminiKnowledgeGraph {
    entities: GeminiEntity[];
    relationships: GeminiRelationship[];
}

// Helper type for our intermediate relationship object
interface RelationObject {
    id: string;
    source: string;
    target: string;
    type: string;
    properties: Record<string, any>;
}

export const genaiService = {
    /**
     * Process text to generate a knowledge graph using Google's Gemini API
     */
    async processTextToKnowledgeGraph(text: string): Promise<KnowledgeGraph> {
        try {
            // Extract entities and relationships using Gemini
            const knowledgeGraph = await this.callGeminiLLM(text);

            if (!knowledgeGraph) {
                throw new Error('Failed to extract knowledge graph from text');
            }

            // Transform into the expected format
            return this.transformToKnowledgeGraph(knowledgeGraph);
        } catch (error) {
            console.error('Error processing text to knowledge graph:', error);
            throw error;
        }
    },

    /**
     * Call Gemini API to extract entities and relationships
     */
    async callGeminiLLM(text: string, maxNodes = 30, maxRelations = 50): Promise<GeminiKnowledgeGraph | null> {
        const prompt = `
      Extract entities and their relationships from the following text. 
      Use natural, human-like relationship names based on common usage. 
      Examples of relationships include: [located_in, president_of, works_as, ally_with, enemy_of, war_with, member_of, reports_to, born_in, leads, governed_by, supports, opposes, involved_in, participates_in, originated_from].
      The LLM should leverage its training knowledge to generate accurate and contextually appropriate relationships. 

      Extract entities with their types from the text based on these categories: 
      [Character, Location, Organisation, Time, Event, Position, Topic, Product].

      Limit the output to a maximum of ${maxNodes} entities and ${maxRelations} relationships.

      Format the output as a JSON object with two keys: 'entities' and 'relationships'.
      Each entity should have the keys: 'type', 'value'.
      Each relationship should have the keys: 'source', 'target', and 'relationship'.

      Text: '${text}'
    `;

        try {
            const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': GEMINI_API_KEY
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            if (!response.ok) {
                throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Extract the response text from Gemini
            const rawText = data.candidates[0].content.parts[0].text;

            // Remove triple backticks and whitespace
            let cleanedText = rawText.trim();
            if (cleanedText.startsWith('```json')) {
                cleanedText = cleanedText.substring(7, cleanedText.length - 3).trim();
            } else if (cleanedText.startsWith('```')) {
                cleanedText = cleanedText.substring(3, cleanedText.length - 3).trim();
            }

            // Parse the JSON
            return JSON.parse(cleanedText);

        } catch (error) {
            console.error('Error calling Gemini API:', error);
            return null;
        }
    },

    /**
     * Transform the Gemini output to our KnowledgeGraph format
     */
    transformToKnowledgeGraph(geminiOutput: GeminiKnowledgeGraph): KnowledgeGraph {
        // Create entities from Gemini output
        const entities: Entity[] = geminiOutput.entities.map((entity, index) => ({
            id: `e-${index}`,
            text: entity.value,
            type: entity.type,
            properties: {}
        }));

        // Create a map for easily finding entities by their value
        const entityMap = new Map<string, Entity>();
        entities.forEach(entity => {
            entityMap.set(entity.text, entity);
        });

        // Create relationships from Gemini output
        const relationObjects: RelationObject[] = geminiOutput.relationships
            .filter(rel => entityMap.has(rel.source) && entityMap.has(rel.target))
            .map((rel, index) => {
                const sourceEntity = entityMap.get(rel.source);
                const targetEntity = entityMap.get(rel.target);

                if (!sourceEntity || !targetEntity) {
                    return null; // This should not happen due to the filter above
                }

                return {
                    id: `r-${index}`,
                    source: sourceEntity.id,
                    target: targetEntity.id,
                    type: rel.relationship,
                    properties: {}
                };
            })
            .filter((rel): rel is RelationObject => rel !== null);

        // Cast the relation objects to the RelationType
        const relations = relationObjects as RelationType[];

        return {
            entities,
            relations
        };
    }
}; 