import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { randomUUID } from 'node:crypto';
import { PrismaModule } from './shared/database/prisma.module';
import { HashModule } from './shared/infrastructure/crypto/hash.module';
import { UserModule } from './modules/users/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        genReqId: (req, res) => {
          const requestIdHeader = req.headers['x-request-id'];
          const requestId = Array.isArray(requestIdHeader)
            ? requestIdHeader[0]
            : requestIdHeader;

          if (requestId && requestId.length > 0) return requestId;

          const generatedRequestId = randomUUID();
          res.setHeader('x-request-id', generatedRequestId);
          return generatedRequestId;
        },
        customReceivedMessage: (req) =>
          `HTTP ${req.method} ${req.url} - request started`,
        customSuccessMessage: (req, res, responseTime) =>
          `HTTP ${req.method} ${req.url} - ${res.statusCode} in ${responseTime}ms`,
        customErrorMessage: (req, res, error) =>
          `HTTP ${req.method} ${req.url} - ${res.statusCode} (${error.message})`,
        customLogLevel: (_req, res, error) => {
          if (error || res.statusCode >= 500) return 'error';
          if (res.statusCode >= 400) return 'warn';
          return 'info';
        },
        customProps: (req) => ({
          requestId: req.id,
          source: 'http',
        }),
        redact: {
          paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'req.body.password',
            'req.body.newPassword',
            'req.body.token',
            'res.headers.set-cookie',
          ],
          remove: true,
        },
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
      },
    }),
    PrismaModule,
    HashModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
