import { Injectable, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(CreateUserUseCase.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashService: HashService,
  ) {}

  async execute(dto: UserCreateDto): Promise<UserResponseDto> {
    this.logger.log(`Iniciando criação de usuário para o email: ${dto.email}`);

    const exists = await this.userRepository.findByEmail(
      Email.create(dto.email),
    );
    if (exists) {
      this.logger.warn(
        `Tentativa de cadastro com email já existente: ${dto.email}`,
      );
      throw new Error('Email already in use');
    }

    const hashedPassword = await this.hashService.generateHash(dto.password);

    const user = new UserEntity({
      id: randomUUID(),
      email: Email.create(dto.email),
      password: Password.fromHash(hashedPassword),
      name: dto.name,
    });
    const saved = await this.userRepository.create(user);

    this.logger.log(`Usuário criado com sucesso. ID: ${saved.id}`);

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
  private readonly logger = new Logger(UpdateUserUseCase.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashService: HashService,
  ) {}

  async execute(
    targetUserId: UserEntity['id'],
    dto: UserUpdateDto,
    requesterUserId: UserEntity['id'],
  ): Promise<UserResponseDto> {
    this.logger.log(
      `Update requested for user ${targetUserId} by requester ${requesterUserId}`,
    );

    const user = await this.userRepository.findById(targetUserId);
    if (!user) {
      this.logger.warn(
        `Update denied: target user ${targetUserId} was not found`,
      );
      throw new Error('User not found');
    }

    const requester = await this.userRepository.findById(requesterUserId);
    if (!requester) {
      this.logger.warn(
        `Update denied: requester user ${requesterUserId} was not found`,
      );
      throw new Error('Requester not found');
    }

    if (!requester.canEdit(targetUserId)) {
      this.logger.warn(
        `Authorization denied: requester ${requesterUserId} cannot update user ${targetUserId}`,
      );
      throw new Error(
        'Unauthorized user , the user is not allowed to do this action',
      );
    }

    if (dto.email && dto.email !== user.email.value) {
      const emailExists = await this.userRepository.findByEmail(
        Email.create(dto.email),
      );
      if (emailExists) {
        this.logger.warn(
          `Update denied: email ${dto.email} is already in use for target user ${targetUserId}`,
        );
        throw new Error('Email already in use');
      }
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
    this.logger.log(`User ${targetUserId} updated successfully`);
    return UserResponseDto.fromEntity(saved);
  }
}

@Injectable()
export class DeleteUserUseCase {
  private readonly logger = new Logger(DeleteUserUseCase.name);

  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    targetUserId: UserEntity['id'],
    requesterUserId: UserEntity['id'],
  ): Promise<void> {
    this.logger.log(
      `Delete requested for user ${targetUserId} by requester ${requesterUserId}`,
    );

    const user = await this.userRepository.findById(targetUserId);
    if (!user) {
      this.logger.warn(
        `Delete denied: target user ${targetUserId} was not found`,
      );
      throw new Error('User not found');
    }

    const requester = await this.userRepository.findById(requesterUserId);
    if (!requester) {
      this.logger.warn(
        `Delete denied: requester user ${requesterUserId} was not found`,
      );
      throw new Error('Requester not found');
    }

    if (!requester.canEdit(targetUserId)) {
      this.logger.warn(
        `Authorization denied: requester ${requesterUserId} cannot delete user ${targetUserId}`,
      );
      throw new Error(
        'Unauthorized user , the user is not allowed to do this action',
      );
    }

    await this.userRepository.delete(targetUserId);
    this.logger.log(`User ${targetUserId} deleted successfully`);
  }
}
