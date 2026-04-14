import * as argon2 from 'argon2';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HashService {
  private readonly pepper: string;

  constructor(private readonly config: ConfigService) {
    this.pepper = this.config.getOrThrow<string>('PEPPER');
  }

  async generateHash(rawPassword: string): Promise<string> {
    return argon2.hash(`${rawPassword}${this.pepper}`);
  }

  async comparePassword(hash: string, rawPassword: string): Promise<boolean> {
    return argon2.verify(hash, `${rawPassword}${this.pepper}`);
  }
}