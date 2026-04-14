import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { UserRole, UserEntity } from '../../domain/entities/user.entity.js';

const VALIDATION_MESSAGES = {
  EMAIL_INVALID:   'The email format is invalid',
  PASSWORD_STRING: 'Password must be a string',
  PASSWORD_MIN:    'Password must be at least 12 characters long',
  PASSWORD_FORMAT: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character', // BUG CORRIGIDO: faltava ':'
  NAME_STRING:     'Name must be a string',
};

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/;

export class UserCreateDto {
  @IsEmail({}, { message: VALIDATION_MESSAGES.EMAIL_INVALID })
  email!: string;

  @IsString({ message: VALIDATION_MESSAGES.PASSWORD_STRING })
  @MinLength(12, { message: VALIDATION_MESSAGES.PASSWORD_MIN })
  @Matches(PASSWORD_REGEX, { message: VALIDATION_MESSAGES.PASSWORD_FORMAT })
  password!: string;

  @IsOptional()
  @IsString({ message: VALIDATION_MESSAGES.NAME_STRING })
  name?: string;
}

export class UserUpdateDto {
  @IsOptional()
  @IsEmail({}, { message: VALIDATION_MESSAGES.EMAIL_INVALID })
  email?: string;

  @IsOptional()
  @IsString({ message: VALIDATION_MESSAGES.PASSWORD_STRING })
  @MinLength(12, { message: VALIDATION_MESSAGES.PASSWORD_MIN })
  @Matches(PASSWORD_REGEX, { message: VALIDATION_MESSAGES.PASSWORD_FORMAT })
  password?: string;

  @IsOptional()
  @IsString({ message: VALIDATION_MESSAGES.NAME_STRING })
  name?: string;
}

export class UserResponseDto {
  id!: string;
  name?: string;
  email!: string;
  role!: UserRole;

  static fromEntity(entity: UserEntity): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id    = entity.id;
    dto.name  = entity.name;
    dto.email = entity.email.value;
    dto.role  = entity.role;
    return dto;
  }
}