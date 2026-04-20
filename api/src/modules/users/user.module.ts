import { Module } from '@nestjs/common';
import { UserRepository } from './domain/repositories/user.repository.js';
import {
  CreateUserUseCase,
  DeleteUserUseCase,
  GetAllUsersUseCase,
  GetByIdUserUseCase,
  UpdateUserUseCase,
} from './application/use-cases/user.use-case.js';
import { UsersController } from './presenters/http/user.http.js';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository.js';

@Module({
  controllers: [UsersController],
  providers: [
    CreateUserUseCase,
    GetByIdUserUseCase,
    GetAllUsersUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    PrismaUserRepository,
    {
      provide: UserRepository,
      useExisting: PrismaUserRepository,
    },
  ],
  exports: [],
})
export class UserModule {}
