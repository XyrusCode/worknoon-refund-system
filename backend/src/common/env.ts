/**
 * Normalizes environment variables from Vercel integrations (e.g. Neon prefix wf_sys_).
 */
export function normalizeEnv(): void {
    if (typeof process === 'undefined' || !process.env) return;

    // Search all keys for matching patterns
    const keys = Object.keys(process.env);

    // 1. Database URL
    if (!process.env['DATABASE_URL']) {
        const matchingKey = keys.find(
            (k) =>
                k.endsWith('DATABASE_URL') ||
                k.endsWith('POSTGRES_PRISMA_URL') ||
                k.endsWith('POSTGRES_URL'),
        );
        if (matchingKey && process.env[matchingKey]) {
            process.env['DATABASE_URL'] = process.env[matchingKey];
        }
    }

    // 2. Direct / Unpooled Database URL
    if (!process.env['DATABASE_URL_UNPOOLED']) {
        const matchingUnpooledKey = keys.find(
            (k) =>
                k.endsWith('DATABASE_URL_UNPOOLED') ||
                k.endsWith('POSTGRES_URL_NON_POOLING'),
        );
        if (matchingUnpooledKey && process.env[matchingUnpooledKey]) {
            process.env['DATABASE_URL_UNPOOLED'] = process.env[matchingUnpooledKey];
        }
    }

    // 3. Google Gemini API Key
    if (!process.env['GOOGLE_GENERATIVE_AI_API_KEY']) {
        const matchingAiKey = keys.find(
            (k) =>
                k.endsWith('GOOGLE_GENERATIVE_AI_API_KEY') ||
                k.endsWith('GEMINI_API_KEY'),
        );
        if (matchingAiKey && process.env[matchingAiKey]) {
            process.env['GOOGLE_GENERATIVE_AI_API_KEY'] = process.env[matchingAiKey];
        }
    }
}

// Immediately normalize on import
normalizeEnv();
