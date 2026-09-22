import '../common/env';
import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy
{
    private readonly logger = new Logger(PrismaService.name);

    constructor() {
        const dbUrl =
            process.env['DATABASE_URL'] ||
            process.env['wf_sys_DATABASE_URL'] ||
            process.env['wf_sys_POSTGRES_PRISMA_URL'] ||
            process.env['wf_sys_POSTGRES_URL'] ||
            process.env['POSTGRES_PRISMA_URL'] ||
            process.env['POSTGRES_URL'];

        super(
            dbUrl
                ? {
                        datasources: {
                            db: {
                                url: dbUrl,
                            },
                        },
                  }
                : undefined,
        );

        if (dbUrl && !process.env['DATABASE_URL']) {
            process.env['DATABASE_URL'] = dbUrl;
        }
    }

    async onModuleInit() {
        try {
            if (!process.env['DATABASE_URL']) {
                this.logger.error(
                    'DATABASE_URL environment variable is missing (checked DATABASE_URL, wf_sys_DATABASE_URL, wf_sys_POSTGRES_PRISMA_URL, POSTGRES_PRISMA_URL).',
                );
                return;
            }
            await this.$connect();
            this.logger.log('Prisma connected to database successfully.');
        } catch (error) {
            this.logger.error('Failed to connect to database via Prisma:', error);
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
