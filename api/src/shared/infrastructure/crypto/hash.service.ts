import * as argon2 from 'argon2';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HashService {
  private readonly logger = new Logger(HashService.name);
  private readonly pepper: string;

  constructor(private readonly config: ConfigService) {
    const pepper = this.config.get<string>('PEPPER');
    if (!pepper) {
      this.logger.warn(
        'PEPPER is not configured; using local development pepper.',
      );
    }
    this.pepper = pepper ?? 'local-development-pepper';
  }

  async generateHash(rawPassword: string): Promise<string> {
    return argon2.hash(`${rawPassword}${this.pepper}`);
  }

  async comparePassword(hash: string, rawPassword: string): Promise<boolean> {
    return argon2.verify(hash, `${rawPassword}${this.pepper}`);
  }
}
