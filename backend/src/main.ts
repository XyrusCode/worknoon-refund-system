import './common/env';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('api');

    const allowedOrigins = [
        'https://worknoon-refund-system-fe.vercel.app',
        'http://localhost:3000',
        'http://localhost:3001',
        process.env['FRONTEND_URL'],
    ].filter(Boolean) as string[];

    app.enableCors({
        origin: (
            origin: string | undefined,
            callback: (err: Error | null, allow?: boolean) => void,
        ) => {
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
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
        credentials: true,
        allowedHeaders: [
            'Content-Type',
            'Accept',
            'Authorization',
            'X-Requested-With',
            'X-Correlation-ID',
            'X-Session-ID',
        ],
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    app.useGlobalFilters(new AllExceptionsFilter());

    const config = new DocumentBuilder()
        .setTitle('WORKNOON Refund API')
        .setDescription('AI-powered customer support refund system')
        .setVersion('1.0')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const port = process.env['PORT'] ?? 3001;
    await app.listen(port);
    console.log(`Backend running on http://localhost:${port}`);
    console.log(`Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();
