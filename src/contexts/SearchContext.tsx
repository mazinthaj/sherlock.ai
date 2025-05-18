import React, { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';
import type { KnowledgeGraph } from '../services/neo4jService';

interface SearchContextType {
    isSearching: boolean;
    searchQuery: string;
    searchResults: KnowledgeGraph | null;
    error: string | null;
    setSearchQuery: (query: string) => void;
    performSearch: (query: string) => Promise<void>;
    clearSearch: () => void;
    setIsSearching: (isSearching: boolean) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

interface SearchProviderProps {
    children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchResults, setSearchResults] = useState<KnowledgeGraph | null>(null);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const performSearch = async (query: string) => {
        if (!query.trim()) return;

        setIsSearching(true);
        setError(null);
        console.log(`Performing search for query: "${query}"`);

        try {
            const response = await fetch('/api/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }),
            });

            console.log(`Search API response status: ${response.status}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response from API:', errorText);
                throw new Error(`Search failed with status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Search results received:', data);
            setSearchResults(data);
        } catch (err) {
            console.error('Search error:', err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
            setIsSearching(false);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults(null);
        setError(null);
    };

    return (
        <SearchContext.Provider
            value={{
                isSearching,
                searchQuery,
                searchResults,
                error,
                setSearchQuery,
                performSearch,
                clearSearch,
                setIsSearching,
            }}
        >
            {children}
        </SearchContext.Provider>
    );
};

export const useSearch = (): SearchContextType => {
    const context = useContext(SearchContext);
    if (context === undefined) {
        throw new Error('useSearch must be used within a SearchProvider');
    }
    return context;
}; 