import { useEffect, useState, useRef, useCallback } from 'react';
import { Box, CircularProgress, Typography, Paper, alpha, Alert, Button, Switch, FormControlLabel, TextField } from '@mui/material';
import { neo4jService, type Entity, type KnowledgeGraph, type RelationType } from '../../services/neo4jService';
import { mockDataService } from '../../services/mockDataService';
import { Network, DataSet } from 'vis-network/standalone';
import { useSearch } from '../../contexts/SearchContext';

// Color mapping for entity types
export const entityColorMap: Record<string, string> = {
    Character: '#3259c7',  // Blue
    Location: '#34A853',   // Green
    Organisation: '#FBBC05', // Yellow
    Time: '#EA4335',       // Red
    Event: '#8F00FF',      // Purple
    Position: '#00ACC1',   // Cyan
    Topic: '#FF6D00',      // Orange
    Product: '#5D4037'     // Brown
};

// Default color if type not found
export const defaultColor = '#757575';

// Legend component that can be used outside the graph
export const KnowledgeGraphLegend = () => {
    return (
        <Paper
            sx={{
                p: 1.5,
                borderRadius: 1.5,
                backdropFilter: 'blur(10px)',
                backgroundColor: alpha('#0f172a', 0.85),
                border: `1px solid ${alpha('#ffffff', 0.15)}`,
            }}
        >
            <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1.5,
                justifyContent: 'center',
            }}>
                {Object.entries(entityColorMap).map(([type, color]) => (
                    <Box
                        key={type}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            fontSize: '0.75rem',
                            color: '#fff',
                        }}
                    >
                        <Box
                            sx={{
                                width: 12,
                                height: 12,
                                backgroundColor: color,
                                borderRadius: '2px'
                            }}
                        />
                        {type}
                    </Box>
                ))}
            </Box>
            <Typography
                variant="body2"
                sx={{
                    fontSize: '0.75rem',
                    color: alpha('#ffffff', 0.7),
                    textAlign: 'center',
                    mt: 1,
                    fontStyle: 'italic'
                }}
            >
                Click on nodes to view details
            </Typography>
        </Paper>
    );
};

interface KnowledgeGraphViewerProps {
    useMockData?: boolean;
}

export const KnowledgeGraphViewer = ({ useMockData = false }: KnowledgeGraphViewerProps) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [graphData, setGraphData] = useState<KnowledgeGraph | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);
    const [fetchTrigger, setFetchTrigger] = useState(0);  // Used to trigger a re-fetch
    const [selectedNode, setSelectedNode] = useState<Entity | null>(null);
    const [showOnlyConnected, setShowOnlyConnected] = useState(false); // Toggle for filtering nodes
    const networkRef = useRef<Network | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Get search context
    const { searchQuery, setSearchQuery, performSearch, isSearching, setIsSearching, searchResults } = useSearch();

    // Helper function to determine node shape based on entity type
    const getNodeShape = (type: string): string => {
        return 'circle';
    };

    // Function to get the node label based on available properties
    const getNodeLabel = (entity: Entity): string => {
        // Check for text property
        if (entity.text) return entity.text;
        // Default label if not available
        return 'No Label';
    };

    // Function to adjust node size based on label length and type
    const getNodeSize = (entity: Entity): number => {
        if (!entity) return 26; // Default size if entity is null

        const baseSize = entity.type === 'Character' ? 36 : 26;

        // Add some size for longer labels
        const label = getNodeLabel(entity);
        const labelLength = label.length || 0;
        const sizeAdjustment = Math.min(labelLength * 0.5, 10); // Cap the size increase
        return baseSize + sizeAdjustment;
    };

    // Update useEffect to handle search results
    useEffect(() => {
        let isMounted = true;
        let timeoutId: number | null = null;

        const fetchData = async () => {
            if (!isMounted) return;

            try {
                console.log("Fetching data with trigger:", fetchTrigger);
                setLoading(true);
                setError(null);

                // If we have search results, use them
                if (searchResults) {
                    console.log("Using search results for knowledge graph");
                    if (!isMounted) return;
                    setConnectionStatus(true);
                    setGraphData(searchResults);
                    setLoading(false);
                    setIsSearching(false); // Turn off search loading state when graph is ready
                    return;
                }

                if (useMockData) {
                    // Use mock data service when useMockData is true
                    console.log("Using mock data service");
                    const data = await mockDataService.getKnowledgeGraph();

                    if (!isMounted) return;
                    setConnectionStatus(true);
                    setGraphData(data);
                    setLoading(false);
                    setIsSearching(false); // Turn off search loading state when graph is ready
                    return;
                }

                // First test the connection
                console.log("Testing connection in KnowledgeGraphViewer");
                const isConnected = await neo4jService.testConnection();

                if (!isMounted) return;
                setConnectionStatus(isConnected);

                if (!isConnected) {
                    setError('Failed to connect to Neo4j database. Please check your connection settings and credentials.');
                    setLoading(false);
                    setIsSearching(false); // Turn off search loading state if connection failed
                    return;
                }

                // If connected, fetch the graph data
                console.log("Fetching graph data in KnowledgeGraphViewer");
                const data = await neo4jService.getKnowledgeGraph();

                if (!isMounted) return;
                setGraphData(data);
                setLoading(false);
                setIsSearching(false); // Turn off search loading state when graph is ready
            } catch (err) {
                if (!isMounted) return;

                console.error('Error in KnowledgeGraphViewer:', err);
                let errorMessage = 'Failed to load graph data';

                if (err instanceof Error) {
                    errorMessage += `: ${err.message}`;
                }

                setError(errorMessage);
                setLoading(false);
                setIsSearching(false); // Turn off search loading state if error occurred
            }
        };

        // Use a small delay before fetching to ensure state is settled
        timeoutId = window.setTimeout(() => {
            fetchData();
        }, 100);

        // Cleanup function
        return () => {
            isMounted = false;
            if (timeoutId !== null) {
                window.clearTimeout(timeoutId);
            }
        };
    }, [fetchTrigger, useMockData, setIsSearching, searchResults]);

    // Add a specific useEffect to handle useMockData changes
    useEffect(() => {
        console.log("useMockData changed to:", useMockData);
        // This will be handled by the key in the parent component which forces remounting
    }, [useMockData]);

    // Also add a specific useEffect to log fetchTrigger changes
    useEffect(() => {
        console.log("fetchTrigger changed to:", fetchTrigger);
    }, [fetchTrigger]);

    const renderVisNetwork = useCallback(() => {
        if (!graphData || !containerRef.current) {
            console.log("Cannot render network: missing graphData or container");
            return;
        }

        // Ensure entities and relations exist
        if (!graphData.entities || !Array.isArray(graphData.entities)) {
            console.error("Invalid graph data: entities is not an array", graphData);
            return;
        }

        if (!graphData.relations || !Array.isArray(graphData.relations)) {
            console.error("Invalid graph data: relations is not an array", graphData);
            return;
        }

        console.log(`Rendering network with ${graphData.entities.length} entities and ${graphData.relations.length} relations`);

        // Clean up previous instance
        if (networkRef.current) {
            try {
                networkRef.current.destroy();
            } catch (e) {
                console.error("Failed to destroy previous network:", e);
            }
            networkRef.current = null;
        }

        // Filter nodes based on showOnlyConnected setting
        let entitiesToShow = [...graphData.entities];

        // If filtering is enabled, only show nodes with relationships
        if (showOnlyConnected) {
            // Get all entity IDs that appear in any relationship
            const connectedIds = new Set<string>();
            graphData.relations.forEach(rel => {
                connectedIds.add(rel.source);
                connectedIds.add(rel.target);
            });

            // Filter entities to only include those with relationships
            entitiesToShow = graphData.entities.filter(entity => connectedIds.has(entity.id));
            console.log(`Filtered to ${entitiesToShow.length} connected entities`);
        }

        // Create nodes dataset with null checks
        const validEntities = entitiesToShow.filter(entity => entity != null);
        const nodes = new DataSet(
            validEntities.map(entity => ({
                id: entity.id || `id-${Math.random()}`,
                label: getNodeLabel(entity),
                title: `${getNodeLabel(entity)} (${entity.type || 'Unknown'})`,
                group: entity.type || 'Unknown',
                font: {
                    color: '#ffffff',
                    size: 18,
                    face: 'Inter',
                    strokeWidth: 2,
                    strokeColor: '#5c5b5b',
                    vadjust: -20,
                    backgroundPadding: { left: 7, right: 7, top: 5, bottom: 5 },
                    align: 'center'
                },
                shape: getNodeShape(entity.type || 'Unknown'),
                size: getNodeSize(entity),
                borderWidth: entity.type === 'Character' ? 3 : 2,
                borderWidthSelected: 4,
                color: {
                    background: entityColorMap[entity.type || 'Unknown'] || defaultColor,
                    border: entityColorMap[entity.type || 'Unknown'] || defaultColor,
                    highlight: {
                        background: entityColorMap[entity.type || 'Unknown'] || defaultColor,
                        border: '#ffffff'
                    }
                },
                margin: {
                    top: 12,
                    bottom: 12,
                    left: 12,
                    right: 12
                },
                labelHighlightBold: true
            }))
        );

        // Create edges dataset with null checks
        const validRelations = graphData.relations.filter(
            relation => relation && relation.source && relation.target
        );

        const edges = new DataSet(
            validRelations.map((relation, index) => ({
                id: `edge-${index}`,
                from: relation.source,
                to: relation.target,
                label: relation.type || '',
                title: relation.type || '',
                arrows: 'to',
                font: {
                    color: '#ffffff',
                    size: 12,
                    background: '#333333',
                    strokeWidth: 0,
                    align: 'middle'
                },
                color: {
                    color: '#999999',
                    highlight: '#ffffff',
                    opacity: 0.8
                },
                smooth: {
                    type: 'curvedCW',
                    roundness: 0.2
                },
                width: 2
            }))
        );

        // Create the network
        const data = {
            nodes,
            edges
        } as any;  // Type assertion to avoid TS errors with vis-network types

        const options = {
            layout: {
                randomSeed: 42,
                improvedLayout: true,
                hierarchical: false
            },
            nodes: {
                shape: 'ellipse', // Default shape
                shadow: {
                    enabled: false
                },
                fixed: {
                    x: false,
                    y: false
                },
                margin: {
                    top: 8,
                    bottom: 8,
                    left: 8,
                    right: 8
                },
                scaling: {
                    min: 16,
                    max: 40
                },
                widthConstraint: {
                    minimum: 60
                },
                font: {
                    face: 'Inter',
                    size: 14,
                    color: '#ffffff',
                    strokeWidth: 0,
                    align: 'center'
                },
                shapeProperties: {
                    borderRadius: 6,     // Rounded corners for boxes
                    interpolation: true,  // Smoother edges
                    useImageSize: false,
                    useBorderWithImage: true
                }
            },
            edges: {
                font: {
                    strokeWidth: 0
                }
            },
            physics: {
                enabled: true,
                barnesHut: {
                    gravitationalConstant: -500,
                    centralGravity: 0.05,
                    springLength: 150,
                    springConstant: 0.01,
                    damping: 0.2,
                    avoidOverlap: 1
                },
                stabilization: { enabled: true, iterations: 200, updateInterval: 10, fit: true, onlyDynamicEdges: false },
                timestep: 0.3,
                adaptiveTimestep: true
            },
            interaction: {
                hover: true,
                tooltipDelay: 300,
                zoomView: true,
                dragView: true,
                dragNodes: true
            }
        };

        // Create the network
        networkRef.current = new Network(containerRef.current, data, options);

        // Add event listeners
        networkRef.current.on('click', function (params) {
            if (params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                const entity = graphData.entities.find(e => e.id === nodeId);
                if (entity) {
                    setSelectedNode(entity);
                }
            } else {
                setSelectedNode(null);
            }
        });

        // Stabilize the network once, then disable physics immediately to prevent rotation
        networkRef.current.once('stabilized', function () {
            console.log('Network stabilized, disabling physics');
            // Immediately disable physics to prevent any rotation
            if (networkRef.current) {
                networkRef.current.setOptions({ physics: false });
                // Fit the view to show all nodes
                networkRef.current.fit();
            }
        });

        // Disable physics after a short timeout even if stabilization hasn't completed
        // This ensures the graph stops moving entirely
        setTimeout(() => {
            if (networkRef.current) {
                console.log('Forcing physics off to prevent rotation');
                networkRef.current.setOptions({ physics: false });
            }
        }, 2000);

    }, [graphData, showOnlyConnected]);

    // Effect to re-render when filter changes
    useEffect(() => {
        if (!loading && graphData) {
            renderVisNetwork();
        }

        // Cleanup
        return () => {
            if (networkRef.current) {
                networkRef.current.destroy();
                networkRef.current = null;
            }
        };
    }, [loading, graphData, renderVisNetwork, showOnlyConnected]);

    // Handle form submission
    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        performSearch(searchQuery);
    };

    if (loading) {
        return (
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                gap: 2
            }}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary">
                    {useMockData ? 'Loading mock data...' : 'Connecting to Neo4j database...'}
                </Typography>
            </Box>
        );
    }

    if (connectionStatus === false && !useMockData) {
        return (
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                padding: 3
            }}>
                <Alert
                    severity="error"
                    sx={{ mb: 2, width: '100%', maxWidth: 600 }}
                >
                    Could not connect to Neo4j database. Please check your connection settings.
                </Alert>
                <Typography variant="body2" sx={{ mb: 2, textAlign: 'center', maxWidth: 600 }}>
                    Make sure the Neo4j database is running and accessible, and that your credentials are correct.
                    Check the browser console for more detailed error information.
                </Typography>
            </Box>
        );
    }

    if (error || !graphData) {
        return (
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                padding: 3
            }}>
                <Alert
                    severity="error"
                    sx={{ mb: 2, width: '100%', maxWidth: 600 }}
                >
                    {error || 'No data available'}
                </Alert>
            </Box>
        );
    }

    if (graphData.entities.length === 0) {
        return (
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                padding: 3
            }}>
                <Alert
                    severity="info"
                    sx={{ mb: 2, width: '100%', maxWidth: 600 }}
                >
                    No entities found in the database. The knowledge graph is empty.
                </Alert>
                <Typography variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
                    Try seeding the database with test data using the "Seed Test Data" button above.
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100%', position: 'relative' }}>
            {/* Filter toggle */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    zIndex: 1000,
                    backgroundColor: alpha('#1e293b', 0.8),
                    borderRadius: 2,
                    padding: '10px 25px 10px 25px',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <FormControlLabel
                    control={
                        <Switch
                            checked={showOnlyConnected}
                            onChange={(e) => setShowOnlyConnected(e.target.checked)}
                            color="primary"
                            size="small"
                        />
                    }
                    label={
                        <Typography variant="body2" color="white" sx={{
                            fontSize: '0.75rem',
                            background: 'transparent',
                        }}>
                            {showOnlyConnected ? 'Show connected only' : 'Show all nodes'}
                        </Typography>
                    }
                    sx={{ margin: 0 }}
                />
            </Box>

            {/* Graph container */}
            <Box
                ref={containerRef}
                sx={{
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0
                }}
            />

            {/* Node details panel when a node is selected */}
            {selectedNode && (
                <Paper
                    sx={{
                        position: 'absolute',
                        top: 20,
                        left: 20,
                        p: 3,
                        width: 320,
                        maxWidth: '80%',
                        backdropFilter: 'blur(10px)',
                        backgroundColor: alpha('#1e293b', 0.9),
                        zIndex: 1000,
                        border: `2px solid ${entityColorMap[selectedNode.type] || defaultColor}`,
                        borderRadius: 2,
                    }}
                >
                    <Typography variant="h6" gutterBottom sx={{
                        borderBottom: `2px solid ${entityColorMap[selectedNode.type] || defaultColor}`,
                        pb: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <span>Entity Details</span>
                        <Box
                            sx={{
                                display: 'inline-block',
                                backgroundColor: entityColorMap[selectedNode.type] || defaultColor,
                                color: '#fff',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 1,
                                fontSize: '0.75rem',
                                fontWeight: 'bold'
                            }}
                        >
                            {selectedNode.type}
                        </Box>
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            {selectedNode.text || 'No Label'}
                        </Typography>
                    </Box>

                    {/* Display relations for this node */}
                    <Typography variant="subtitle2" sx={{
                        mb: 1,
                        fontWeight: 'bold',
                        fontSize: '1rem'
                    }}>Relations:</Typography>
                    <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                        {graphData.relations
                            .filter(rel => rel.source === selectedNode.id || rel.target === selectedNode.id)
                            .map((rel, index) => {
                                const isSource = rel.source === selectedNode.id;
                                const otherEntityId = isSource ? rel.target : rel.source;
                                const otherEntity = graphData.entities.find(e => e.id === otherEntityId);

                                if (!otherEntity) return null;

                                return (
                                    <Box
                                        key={index}
                                        sx={{
                                            p: 1.5,
                                            mb: 1.5,
                                            borderRadius: 1,
                                            backgroundColor: alpha('#ffffff', 0.15),
                                            fontSize: '0.875rem',
                                            border: `1px solid ${alpha('#ffffff', 0.3)}`,
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                backgroundColor: alpha('#ffffff', 0.2),
                                                transform: 'translateY(-2px)'
                                            }
                                        }}
                                    >
                                        {isSource ? (
                                            <>
                                                <Box sx={{
                                                    display: 'inline-block',
                                                    backgroundColor: alpha('#ffffff', 0.2),
                                                    px: 0.8,
                                                    py: 0.3,
                                                    borderRadius: 1,
                                                    mr: 1,
                                                    fontSize: '0.75rem',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {rel.type}
                                                </Box>
                                                to{' '}
                                                <span style={{
                                                    color: entityColorMap[otherEntity.type] || defaultColor,
                                                    fontWeight: 'bold'
                                                }}>
                                                    {otherEntity.text || 'No Label'}
                                                </span>
                                                <Box
                                                    sx={{
                                                        display: 'inline-block',
                                                        backgroundColor: entityColorMap[otherEntity.type] || defaultColor,
                                                        ml: 1,
                                                        width: 10,
                                                        height: 10,
                                                        borderRadius: '50%',
                                                    }}
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <span style={{
                                                    color: entityColorMap[otherEntity.type] || defaultColor,
                                                    fontWeight: 'bold'
                                                }}>
                                                    <Box
                                                        sx={{
                                                            display: 'inline-block',
                                                            backgroundColor: entityColorMap[otherEntity.type] || defaultColor,
                                                            mr: 1,
                                                            width: 10,
                                                            height: 10,
                                                            borderRadius: '50%',
                                                        }}
                                                    />
                                                    {otherEntity.text || 'No Label'}
                                                </span>
                                                {' '}
                                                <Box sx={{
                                                    display: 'inline-block',
                                                    backgroundColor: alpha('#ffffff', 0.2),
                                                    px: 0.8,
                                                    py: 0.3,
                                                    borderRadius: 1,
                                                    mx: 1,
                                                    fontSize: '0.75rem',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {rel.type}
                                                </Box>
                                                to this
                                            </>
                                        )}
                                    </Box>
                                );
                            })}
                    </Box>

                    <Button
                        size="small"
                        variant="contained"
                        onClick={() => {
                            console.log('Closing details panel');
                            setSelectedNode(null);
                        }}
                        sx={{
                            mt: 2,
                            backgroundColor: entityColorMap[selectedNode.type] || defaultColor,
                            '&:hover': {
                                backgroundColor: alpha(entityColorMap[selectedNode.type] || defaultColor, 0.8),
                            },
                            cursor: 'pointer'
                        }}
                        fullWidth
                    >
                        Close Details
                    </Button>
                </Paper>
            )}
        </Box>
    );
}; 