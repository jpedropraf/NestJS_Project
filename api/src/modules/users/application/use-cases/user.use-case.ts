import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  UserCreateDto,
  UserUpdateDto,
  UserResponseDto,
} from '../../presenters/dtos/user.dto.js';
import { UserRepository } from '../../domain/repositories/user.repository.js';
import {
  UserEntity,
  Email,
  Password,
} from '../../domain/entities/user.entity.js';
import { HashService } from '../../../../shared/infrastructure/crypto/hash.service.js';
@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashService: HashService,
  ) {}

  async execute(dto: UserCreateDto): Promise<UserResponseDto> {
    const exists = await this.userRepository.findByEmail(
      Email.create(dto.email),
    );
    if (exists) throw new Error('Email already in use');

    const hashedPassword = await this.hashService.generateHash(dto.password);
    const user = new UserEntity({
      id: randomUUID(),
      email: Email.create(dto.email),
      password: Password.fromHash(hashedPassword),
      name: dto.name,
    });
    const saved = await this.userRepository.create(user);

    return UserResponseDto.fromEntity(saved);
  }
}

@Injectable()
export class GetByIdUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: UserEntity['id']): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');

    return UserResponseDto.fromEntity(user);
  }
}

@Injectable()
export class GetAllUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findAll();
    return users.map((user) => UserResponseDto.fromEntity(user));
  }
}

@Injectable()
export class UpdateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashService: HashService,
  ) {}

  async execute(
    targetUserId: UserEntity['id'],
    dto: UserUpdateDto,
    requesterUserId: UserEntity['id'],
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(targetUserId);
    if (!user) throw new Error('User not found');

    const requester = await this.userRepository.findById(requesterUserId);
    if (!requester) throw new Error('Requester not found');

    if (!requester.canEdit(targetUserId)) {
      throw new Error(
        'Unauthorized user , the user is not allowed to do this action',
      );
    }

    if (dto.email && dto.email !== user.email.value) {
      const emailExists = await this.userRepository.findByEmail(
        Email.create(dto.email),
      );
      if (emailExists) throw new Error('Email already in use');
    }

    const newPassword = dto.password
      ? Password.fromHash(await this.hashService.generateHash(dto.password))
      : undefined;

    const updated = user.withUpdates({
      email: dto.email ? Email.create(dto.email) : undefined,
      password: newPassword,
      name: dto.name,
    });

    const saved = await this.userRepository.update(targetUserId, updated);
    return UserResponseDto.fromEntity(saved);
  }
}

@Injectable()
export class DeleteUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    targetUserId: UserEntity['id'],
    requesterUserId: UserEntity['id'],
  ): Promise<void> {
    const user = await this.userRepository.findById(targetUserId);
    if (!user) throw new Error('User not found');

    const requester = await this.userRepository.findById(requesterUserId);
    if (!requester) throw new Error('Requester not found');

    if (!requester.canEdit(targetUserId)) {
      throw new Error(
        'Unauthorized user , the user is not allowed to do this action',
      );
    }

    await this.userRepository.delete(targetUserId);
  }
}
