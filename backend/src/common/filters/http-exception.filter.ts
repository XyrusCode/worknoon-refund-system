import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';

/** Flat error envelope per ERP / TabulaRasa standard: {statusCode, error, message, requestId, timestamp}. */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const requestId =
            (request.headers['x-request-id'] as string | undefined) ??
            (request.headers['x-correlation-id'] as string | undefined) ??
            randomUUID();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let error = 'Internal Server Error';
        let message: string | string[] = 'Internal server error';
        let errors: unknown = undefined;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const body = exception.getResponse();
            if (typeof body === 'string') {
                error = exception.name;
                message = body;
            } else {
                const record = body as { error?: string; message?: string | string[]; errors?: unknown };
                error = record.error ?? exception.name;
                message = record.message ?? exception.message;
                errors = record.errors;
            }
        } else if (exception instanceof Error) {
            error = exception.name || 'Error';
            message = exception.message;
            const errWithMeta = exception as Error & { code?: string; meta?: Record<string, unknown> };
            if (errWithMeta.code) {
                error = errWithMeta.code;
            }
            if (errWithMeta.meta) {
                errors = errWithMeta.meta;
            }
        }

        const logMsg = `[${request.method}] ${request.url} - ${status} [${error}] - ${Array.isArray(message) ? message.join(', ') : message}`;
        if (status >= 500) {
            this.logger.error(logMsg, exception instanceof Error ? exception.stack : undefined);
        } else {
            this.logger.warn(logMsg);
        }

        response.status(status).json({
            statusCode: status,
            error,
            message,
            errors,
            requestId,
            path: request.url,
            timestamp: new Date().toISOString(),
        });
    }
}
