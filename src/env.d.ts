/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_NEO4J_URI: string
    readonly VITE_NEO4J_URI_SSC: string
    readonly VITE_NEO4J_URI_UNENCRYPTED: string
    readonly VITE_NEO4J_USERNAME: string
    readonly VITE_NEO4J_PASSWORD: string
    readonly VITE_GEMINI_API_KEY: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
} 