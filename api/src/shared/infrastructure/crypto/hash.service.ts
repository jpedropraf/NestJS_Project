import * as argon2 from 'argon2';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HashService {
  constructor(private readonly config: ConfigService) {}

  async generateHash(rawPassword: string): Promise<string> {
    const pepper = this.config.getOrThrow<string>('PEPPER');
    return argon2.hash(`${rawPassword}${pepper}`);
  }

  async comparePassword(hash: string, rawPassword: string): Promise<boolean> {
    const pepper = this.config.getOrThrow<string>('PEPPER');
    return argon2.verify(hash, `${rawPassword}${pepper}`);
  }

  async comparePassowrd(hash: string, rawPassword: string): Promise<boolean> {
    return this.comparePassword(hash, rawPassword);
  }
}
