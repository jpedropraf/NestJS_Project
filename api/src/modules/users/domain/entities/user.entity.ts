import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/;
const PASSWORD_MIN_LENGTH = 12;

const VALIDATION_MESSAGES = {
  EMAIL_INVALID: 'The email format is invalid',
  PASSWORD_STRING: 'Password must be a string',
  PASSWORD_MIN: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
  PASSWORD_FORMAT: 'Password must contain at least one uppercase, one lowercase, one number, and one special character',
  NAME_STRING: 'Name must be a string',
};

export class Password {
  private readonly _value: string;
  private constructor(value: string) { this._value = value; }

  public static create(rawPassword: string): Password {
    if (!rawPassword || rawPassword.length < PASSWORD_MIN_LENGTH || !PASSWORD_REGEX.test(rawPassword)) {
      throw new Error(VALIDATION_MESSAGES.PASSWORD_FORMAT);
    }
    return new Password(rawPassword);
  }

  public static fromHash(hash: string): Password { return new Password(hash); }
  public get value(): string { return this._value; }
}

export class Email {
  private readonly _value: string;
  private constructor(value: string) { this._value = value; }

  public static create(raw: string): Email {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!raw || !emailRegex.test(raw)) throw new Error('Invalid email.');
    return new Email(raw.toLowerCase().trim());
  }

  public static fromValue(value: string): Email { return new Email(value); }
  public get value(): string { return this._value; }
}

export class GoogleId {
  private readonly _value: string;
  private constructor(value: string) { this._value = value; }

  public static create(raw: string): GoogleId {
    if (!raw || raw.trim().length === 0) throw new Error('Invalid GoogleId.');
    return new GoogleId(raw.trim());
  }

  public static fromValue(value: string): GoogleId { return new GoogleId(value); }
  public get value(): string { return this._value; }
}


export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface UserProperties {
  id: string;
  email: Email;
  password?: Password;
  googleId?: GoogleId;
  name?: string;
  role?: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserEntity {
  readonly id: string;
  readonly email: Email;
  readonly password?: Password;
  readonly googleId?: GoogleId;
  readonly name?: string;
  readonly role: UserRole;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(properties: UserProperties) {
    this.id = properties.id;
    this.email = properties.email;
    this.password = properties.password;
    this.googleId = properties.googleId;
    this.name = properties.name;
    this.role = properties.role ?? UserRole.USER;
    this.createdAt = properties.createdAt ?? new Date();
    this.updatedAt = properties.updatedAt ?? new Date();
  }

  get isAdmin(): boolean { return this.role === UserRole.ADMIN; }
  get isSocialLogin(): boolean { return !!this.googleId; }

  withUpdates(changes: Partial<Omit<UserProperties, 'id' | 'createdAt'>>): UserEntity {
    return new UserEntity({
      ...this,
      ...changes,
      updatedAt: new Date(),
    } as UserProperties);
  }
}



export class UserCreateDto {
  @ApiProperty({ example: 'john.doe@example.com', description: 'User email' })
  @IsEmail({}, { message: VALIDATION_MESSAGES.EMAIL_INVALID })
  email!: string;

  @ApiProperty({ 
    example: 'StrongPass@123', 
    description: 'Min 12 chars, upper, lower, number, special',
    minLength: 12 
  })
  @IsString({ message: VALIDATION_MESSAGES.PASSWORD_STRING })
  @MinLength(12, { message: VALIDATION_MESSAGES.PASSWORD_MIN })
  @Matches(PASSWORD_REGEX, { message: VALIDATION_MESSAGES.PASSWORD_FORMAT })
  password!: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString({ message: VALIDATION_MESSAGES.NAME_STRING })
  name?: string;
}

export class UserUpdateDto {
  @ApiPropertyOptional({ example: 'new.email@example.com' })
  @IsOptional()
  @IsEmail({}, { message: VALIDATION_MESSAGES.EMAIL_INVALID })
  email?: string;

  @ApiPropertyOptional({ example: 'NewStrongPass@2024' })
  @IsOptional()
  @IsString({ message: VALIDATION_MESSAGES.PASSWORD_STRING })
  @MinLength(12, { message: VALIDATION_MESSAGES.PASSWORD_MIN })
  @Matches(PASSWORD_REGEX, { message: VALIDATION_MESSAGES.PASSWORD_FORMAT })
  password?: string;

  @ApiPropertyOptional({ example: 'John Updated' })
  @IsOptional()
  @IsString({ message: VALIDATION_MESSAGES.NAME_STRING })
  name?: string;
}

export class UserResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  name?: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  email!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.USER })
  role!: UserRole;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  createdAt!: Date;

  static fromEntity(entity: UserEntity): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.email = entity.email.value;
    dto.role = entity.role;
    dto.createdAt = entity.createdAt;
    return dto;
  }
}
