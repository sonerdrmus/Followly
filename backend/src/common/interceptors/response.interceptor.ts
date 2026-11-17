import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';

type Envelope = {
  success: boolean;
  data?: unknown;
  message?: string;
  code?: string;
};

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((body: unknown) => {
        if (context.getType() === 'http') {
          const response = context.switchToHttp().getResponse<{ headersSent?: boolean }>();
          if (response.headersSent) {
            return body;
          }
        }
        if (isEnvelope(body)) {
          return body;
        }
        return {
          success: true,
          data: body ?? null,
          message: 'Operation completed',
        };
      }),
    );
  }
}

function isEnvelope(body: unknown): body is Envelope {
  return typeof body === 'object' && body !== null && 'success' in body;
}
