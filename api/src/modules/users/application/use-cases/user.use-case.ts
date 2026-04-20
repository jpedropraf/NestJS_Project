import { UserCreateDto, UserUpdateDto, UserResponseDto } from '../../presenters/dto/user.dto.js';
import { UserRepository }                               from '../../domain/repositories/user.repository.js';
import { UserEntity, Email, Password }                  from '../../domain/entities/user.entity.js';
import { HashService }                                  from 'src/shared/infrastructure/crypto/hash.service.js';



export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashService:    HashService,
  ) {}

  async execute(dto: UserCreateDto): Promise<UserResponseDto> {
    const exists = await this.userRepository.findByEmail(Email.create(dto.email));
    if (exists) throw new Error('Email already in use');

    const hashedPassword = await this.hashService.generateHash(dto.password);
    const user = UserEntity.createFromDto(dto, hashedPassword);
    const saved = await this.userRepository.create(user);

    return UserResponseDto.fromEntity(saved);
  }
}



export class GetByIdUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: UserEntity['id']): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');

    return UserResponseDto.fromEntity(user);
  }
}


export class GetAllUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findAll();
    return users.map(UserResponseDto.fromEntity);
  }
}


export class UpdateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashService:    HashService,
  ) {}

  async execute(targetUserId: UserEntity['id'],dto:UserUpdateDto,requesterUserId: UserEntity['id']): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(targetUserId);
    if (!user) throw new Error('User not found');

    const requester = await this.userRepository.findById(requesterUserId);
    if (!requester) throw new Error('Requester not found');

    if (!requester.canEdit(targetUserId)) {
      throw new Error('Unauthorized user , the user is not allowed to do this action');
    }

    if (dto.email && dto.email !== user.email.value) {
      const emailExists = await this.userRepository.findByEmail(Email.create(dto.email));
      if (emailExists) throw new Error('Email already in use');
    }

    const newPassword = dto.password
      ? Password.fromHash(await this.hashService.generateHash(dto.password))
      : undefined;

    const updated = user.withUpdates({
      email:    dto.email    ? Email.create(dto.email) : undefined,
      password: newPassword,
      name:     dto.name,
    });

    const saved = await this.userRepository.update(targetUserId, updated);
    return UserResponseDto.fromEntity(saved);
  }
}


export class DeleteUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(targetUserId: UserEntity['id'], requesterUserId: UserEntity['id']): Promise<void> {
    const user = await this.userRepository.findById(targetUserId);
    if (!user) throw new Error('User not found');

    const requester = await this.userRepository.findById(requesterUserId);
    if (!requester) throw new Error('Requester not found');

    if (!requester.canEdit(targetUserId)) {
      throw new Error('Unauthorized user , the user is not allowed to do this action');
    }

    await this.userRepository.delete(targetUserId);
  }
}