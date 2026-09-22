import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
    constructor(private readonly prisma: PrismaService) {}

    @Get()
    getRoot() {
        return {
            status: 'ok',
            service: 'WORKNOON Refund System API',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
        };
    }

    @Get('health')
    async getHealth() {
        let dbStatus = 'disconnected';
        let dbError: string | null = null;
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            dbStatus = 'connected';
        } catch (err) {
            dbStatus = 'error';
            dbError = err instanceof Error ? err.message : String(err);
        }

        const envKeys = Object.keys(process.env).filter((k) => !k.includes('KEY') && !k.includes('SECRET') && !k.includes('PASSWORD'));
        const dbKeys = Object.keys(process.env).filter((k) => k.toLowerCase().includes('database') || k.toLowerCase().includes('postgres') || k.toLowerCase().includes('prisma') || k.toLowerCase().includes('url'));

        return {
            status: 'ok',
            database: {
                status: dbStatus,
                error: dbError,
            },
            hasDatabaseUrl: Boolean(process.env['DATABASE_URL']),
            hasGeminiKey: Boolean(process.env['GOOGLE_GENERATIVE_AI_API_KEY']),
            detectedDbKeys: dbKeys,
            nodeEnv: process.env['NODE_ENV'] || 'development',
            timestamp: new Date().toISOString(),
        };
    }
}
