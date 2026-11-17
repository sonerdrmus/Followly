import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

type ErrorBody = {
  success: false;
  message: string;
  code: string;
  data?: unknown;
};

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      response.status(status).json(this.fromHttpException(exception));
      return;
    }

    this.logger.error(exception instanceof Error ? exception.name : 'UnknownError');
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Something went wrong.',
      code: 'INTERNAL_ERROR',
    } satisfies ErrorBody);
  }

  private fromHttpException(exception: HttpException): ErrorBody {
    const status = exception.getStatus();
    const raw = exception.getResponse();

    if (status === HttpStatus.TOO_MANY_REQUESTS) {
      return {
        success: false,
        message: 'Too many requests. Wait a moment and try again.',
        code: 'RATE_LIMITED',
      };
    }

    if (typeof raw === 'string') {
      return { success: false, message: raw, code: codeForStatus(status) };
    }

    if (typeof raw === 'object' && raw !== null) {
      const body = raw as Record<string, unknown>;
      const message = Array.isArray(body.message)
        ? body.message.filter((item) => typeof item === 'string').join(' ')
        : typeof body.message === 'string'
          ? body.message
          : 'Request could not be completed.';
      const code = typeof body.code === 'string' ? body.code : codeForStatus(status);
      const result: ErrorBody = { success: false, message, code };
      if (body.data !== undefined) {
        result.data = body.data;
      }
      return result;
    }

    return {
      success: false,
      message: 'Request could not be completed.',
      code: codeForStatus(status),
    };
  }
}

function codeForStatus(status: number): string {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return 'VALIDATION_ERROR';
    case HttpStatus.UNAUTHORIZED:
      return 'UNAUTHORIZED';
    case HttpStatus.FORBIDDEN:
      return 'FORBIDDEN';
    case HttpStatus.NOT_FOUND:
      return 'NOT_FOUND';
    case HttpStatus.CONFLICT:
      return 'CONFLICT';
    case HttpStatus.TOO_MANY_REQUESTS:
      return 'RATE_LIMITED';
    case HttpStatus.SERVICE_UNAVAILABLE:
      return 'SERVICE_UNAVAILABLE';
    default:
      return 'REQUEST_FAILED';
  }
}
