import neo4j from 'neo4j-driver';

// Neo4j credentials from the notebook
const NEO4J_URI = "neo4j+s://2c1a2b01.databases.neo4j.io";
const NEO4J_URI_SSC = "neo4j+ssc://2c1a2b01.databases.neo4j.io";
const NEO4J_URI_UNENCRYPTED = "neo4j://2c1a2b01.databases.neo4j.io";
const NEO4J_USERNAME = "neo4j";
const NEO4J_PASSWORD = "epnbfOrO05Sg80PQ04Ty0RY-8D1-Tan4O5-v8A0GKsE";


export async function troubleshootConnection() {
    console.log("🔍 Starting Neo4j connection troubleshooting...");

    // Check if this might be a credentials issue
    console.log("\n🔑 Checking credentials...");
    const passwordHidden = NEO4J_PASSWORD.substring(0, 3) + "..." + NEO4J_PASSWORD.substring(NEO4J_PASSWORD.length - 3);
    console.log(`Using username: ${NEO4J_USERNAME}`);
    console.log(`Using password: ${passwordHidden} (length: ${NEO4J_PASSWORD.length})`);
    console.log(`URI being used: ${NEO4J_URI}`);
    console.log("Note: Neo4j Aura credentials can expire or be invalidated. Check your Aura console to verify the database is active and credentials are valid.");

    // Method 1: URI scheme with +s (full certificates)
    await tryConnection(1, "neo4j+s URI scheme (full certificates)", async () => {
        const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD));
        await driver.verifyConnectivity();
        await driver.close();
    });

    // Method 2: URI scheme with +ssc (self-signed certificates)
    await tryConnection(2, "neo4j+ssc URI scheme (self-signed certificates)", async () => {
        const driver = neo4j.driver(NEO4J_URI_SSC, neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD));
        await driver.verifyConnectivity();
        await driver.close();
    });

    // Method 3-6: Unencrypted URI with config
    await tryConnection(3, "neo4j URI with system CA certificates", async () => {
        const driver = neo4j.driver(NEO4J_URI_UNENCRYPTED, neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD), {
            encrypted: 'ENCRYPTION_ON',
            trust: 'TRUST_SYSTEM_CA_SIGNED_CERTIFICATES'
        });
        await driver.verifyConnectivity();
        await driver.close();
    });

    await tryConnection(4, "neo4j URI with custom CA certificates", async () => {
        const driver = neo4j.driver(NEO4J_URI_UNENCRYPTED, neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD), {
            encrypted: 'ENCRYPTION_ON',
            trust: 'TRUST_CUSTOM_CA_SIGNED_CERTIFICATES'
        });
        await driver.verifyConnectivity();
        await driver.close();
    });

    await tryConnection(5, "neo4j URI with trust all certificates", async () => {
        const driver = neo4j.driver(NEO4J_URI_UNENCRYPTED, neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD), {
            encrypted: 'ENCRYPTION_ON',
            trust: 'TRUST_ALL_CERTIFICATES'
        });
        await driver.verifyConnectivity();
        await driver.close();
    });

    await tryConnection(6, "neo4j URI with encryption OFF", async () => {
        const driver = neo4j.driver(NEO4J_URI_UNENCRYPTED, neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD), {
            encrypted: 'ENCRYPTION_OFF'
        });
        await driver.verifyConnectivity();
        await driver.close();
    });

    // Method 7: Extended timeout
    await tryConnection(7, "neo4j+s URI with extended timeout (60s)", async () => {
        const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD), {
            connectionTimeout: 60000, // 60 seconds
            connectionAcquisitionTimeout: 60000, // 60 seconds
        });
        await driver.verifyConnectivity();
        await driver.close();
    });

    // Method 8: HTTP ping
    await tryConnection(8, "Check if the server is accessible via HTTP ping", async () => {
        try {
            const url = NEO4J_URI.replace('neo4j+s://', 'https://');
            const response = await fetch(url);
            console.log(`HTTP response status: ${response.status}`);
        } catch (error) {
            console.error("HTTP request failed:", error);
        }
    });

    // Method 9: Try with different credentials format 
    await tryConnection(9, "neo4j URI with credentials as separate parameters", async () => {
        const driver = neo4j.driver(
            NEO4J_URI_UNENCRYPTED,
            neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD),
            { encrypted: 'ENCRYPTION_ON' }
        );
        await driver.verifyConnectivity();
        await driver.close();
    });

    // Method 10: Check if hostname is valid
    await tryConnection(10, "Check hostname resolution", async () => {
        try {
            const hostname = NEO4J_URI.replace("neo4j+s://", "");
            const response = await fetch(`https://dns.google/resolve?name=${hostname}`);
            const data = await response.json();

            if (data.Answer && data.Answer.length > 0) {
                console.log(`Hostname ${hostname} resolves to IP: ${data.Answer[0].data}`);
            } else {
                throw new Error(`Failed to resolve hostname ${hostname}`);
            }
        } catch (error) {
            console.error("Hostname resolution check failed:", error);
            throw error;
        }
    });

    // Display conclusion
    console.log("\n🔍 Troubleshooting complete.");
    console.log("If all connection methods failed, consider:");
    console.log("1. Neo4j Aura database may be paused or deleted");
    console.log("2. Credentials may have expired or been changed");
    console.log("3. Network connectivity issues (firewalls, proxies)");
    console.log("4. Visit https://console.neo4j.io to check your database status");
    console.log("\nIn the meantime, you can use the local mock data option.");
}

async function tryConnection(methodNumber: number, methodName: string, connectionFn: () => Promise<void>): Promise<boolean> {
    console.log(`\n📋 Method ${methodNumber}: ${methodName}`);
    console.log("─".repeat(50));

    try {
        console.log("Attempting connection...");
        const startTime = Date.now();
        await connectionFn();
        const endTime = Date.now();

        console.log(`✅ SUCCESS! Connection established in ${endTime - startTime}ms`);
        return true;
    } catch (error) {
        console.error("❌ CONNECTION FAILED");
        if (error instanceof Error) {
            console.error(`Error: ${error.message}`);
            console.error(`Cause: ${(error as any).cause?.message || 'No cause specified'}`);

            // Specific error info
            if (error.message.includes("authentication") ||
                error.message.includes("credentials") ||
                error.message.includes("password")) {
                console.error("👉 HINT: This appears to be an authentication error. Your credentials may be invalid or expired.");
            }
            if (error.message.includes("certificate") ||
                error.message.includes("SSL") ||
                error.message.includes("trust")) {
                console.error("👉 HINT: This appears to be a certificate/encryption error.");
            }
            if (error.message.includes("timeout") ||
                error.message.includes("timed out")) {
                console.error("👉 HINT: Connection timeout. The server may be unavailable or blocked by a firewall.");
            }
            if (error.message.includes("database") && error.message.includes("not found")) {
                console.error("👉 HINT: The database does not exist or was deleted. Check your Neo4j Aura console.");
            }
        } else {
            console.error("Unknown error type:", error);
        }
        return false;
    }
} 