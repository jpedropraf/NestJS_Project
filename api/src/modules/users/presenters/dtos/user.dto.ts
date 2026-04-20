import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { UserRole, UserEntity } from '../../domain/entities/user.entity.js';

const VALIDATION_MESSAGES = {
  EMAIL_INVALID: 'The email format is invalid',
  PASSWORD_STRING: 'Password must be a string',
  PASSWORD_MIN: 'Password must be at least 12 characters long',
  PASSWORD_FORMAT:
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  NAME_STRING: 'Name must be a string',
};

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/;

export class UserCreateDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The unique email of the user',
  })
  @IsEmail({}, { message: VALIDATION_MESSAGES.EMAIL_INVALID })
  email!: string;

  @ApiProperty({
    example: 'StrongPass@123',
    description:
      'Password must be min 12 chars with upper, lower, number and special char',
    minLength: 12,
  })
  @IsString({ message: VALIDATION_MESSAGES.PASSWORD_STRING })
  @MinLength(12, { message: VALIDATION_MESSAGES.PASSWORD_MIN })
  @Matches(PASSWORD_REGEX, { message: VALIDATION_MESSAGES.PASSWORD_FORMAT })
  password!: string;

  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Full name of the user',
  })
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
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'The UUID of the user',
  })
  id!: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  name?: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  email!: string;

  @ApiProperty({
    enum: UserRole,
    example: 'admin',
    description: 'User permission level',
  })
  role!: UserRole;

  static fromEntity(entity: UserEntity): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.email = entity.email.value;
    dto.role = entity.role;
    return dto;
  }
}
