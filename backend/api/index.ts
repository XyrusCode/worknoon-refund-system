import '../src/common/env';
import 'reflect-metadata';
import express from 'express';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';

let cachedServer: express.Express | undefined;

async function bootstrap(): Promise<express.Express> {
    if (cachedServer) return cachedServer;

    const server = express();
    const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(server), {
        logger: ['error', 'warn', 'log'],
    });

    nestApp.setGlobalPrefix('api');

    const allowedOrigins = [
        'https://worknoon-refund-system-fe.vercel.app',
        'http://localhost:3000',
        'http://localhost:3001',
        process.env['FRONTEND_URL'],
    ].filter(Boolean) as string[];

    nestApp.enableCors({
        origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
            if (
                !origin ||
                allowedOrigins.includes(origin) ||
                origin.endsWith('.vercel.app') ||
                origin.includes('localhost')
            ) {
                callback(null, true);
            } else {
                callback(null, true);
            }
        },
        credentials: true,
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Accept',
            'Authorization',
            'X-Requested-With',
            'X-Request-ID',
            'X-Correlation-ID',
            'X-Session-ID',
        ],
    });

    nestApp.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    nestApp.useGlobalFilters(new AllExceptionsFilter());

    const config = new DocumentBuilder()
        .setTitle('WORKNOON Refund API')
        .setDescription('AI-powered customer support refund system')
        .setVersion('1.0')
        .build();
    const document = SwaggerModule.createDocument(nestApp, config);
    SwaggerModule.setup('api/docs', nestApp, document);

    await nestApp.init();
    cachedServer = server;
    return server;
}

export default async function handler(req: express.Request, res: express.Response): Promise<void> {
    const server = await bootstrap();
    server(req, res);
}
