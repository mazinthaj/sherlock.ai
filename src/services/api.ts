interface DataSource {
    id: number;
    name: string;
    type: string;
    url: string;
    lastUpdated: string;
}

interface ApiResponse<T> {
    data?: T;
    error?: string;
}

const API_URL = 'http://localhost:5000/api';

/**
 * Fetch all data sources
 */
export async function fetchDataSources(): Promise<ApiResponse<DataSource[]>> {
    try {
        const response = await fetch(`${API_URL}/data-sources`);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return { data };
    } catch (error) {
        console.error('Error fetching data sources:', error);
        return { error: error instanceof Error ? error.message : 'An unknown error occurred' };
    }
}

/**
 * Fetch a single data source by ID
 */
export async function fetchDataSourceById(id: number): Promise<ApiResponse<DataSource>> {
    try {
        const response = await fetch(`${API_URL}/data-sources/${id}`);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return { data };
    } catch (error) {
        console.error(`Error fetching data source ${id}:`, error);
        return { error: error instanceof Error ? error.message : 'An unknown error occurred' };
    }
}

/**
 * Create a new data source
 */
export async function createDataSource(dataSource: Omit<DataSource, 'id' | 'lastUpdated'>): Promise<ApiResponse<DataSource>> {
    try {
        const response = await fetch(`${API_URL}/data-sources`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataSource),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return { data };
    } catch (error) {
        console.error('Error creating data source:', error);
        return { error: error instanceof Error ? error.message : 'An unknown error occurred' };
    }
}

/**
 * Update an existing data source
 */
export async function updateDataSource(id: number, updates: Partial<DataSource>): Promise<ApiResponse<DataSource>> {
    try {
        const response = await fetch(`${API_URL}/data-sources/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return { data };
    } catch (error) {
        console.error(`Error updating data source ${id}:`, error);
        return { error: error instanceof Error ? error.message : 'An unknown error occurred' };
    }
}

/**
 * Delete a data source
 */
export async function deleteDataSource(id: number): Promise<ApiResponse<{ message: string }>> {
    try {
        const response = await fetch(`${API_URL}/data-sources/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return { data };
    } catch (error) {
        console.error(`Error deleting data source ${id}:`, error);
        return { error: error instanceof Error ? error.message : 'An unknown error occurred' };
    }
}

// Export types
export type { DataSource, ApiResponse }; 