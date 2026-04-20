import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private readonly client: PrismaClient;

  constructor(config: ConfigService) {
    const databaseUrl = config.get<string>('DATABASE_URL');
    if (!databaseUrl) {
      this.logger.warn(
        'DATABASE_URL is not configured; using local development URL.',
      );
    }
    const connectionString =
      databaseUrl ?? 'postgresql://postgres:postgres@localhost:5432/postgres';
    const adapter = new PrismaPg(connectionString);
    this.client = new PrismaClient({ adapter });
  }

  async onModuleInit() {
    return Promise.resolve();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }

  get clientInstance(): PrismaClient {
    return this.client;
  }
}
