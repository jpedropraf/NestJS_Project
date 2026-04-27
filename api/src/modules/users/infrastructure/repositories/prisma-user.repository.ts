import { Injectable, Logger } from '@nestjs/common';
import { Role } from '@prisma/client';
import {
  UserEntity,
  Email,
  GoogleId,
  Password,
  UserRole,
} from '../../domain/entities/user.entity.js';
import { UserRepository } from '../../domain/repositories/user.repository.js';
import { PrismaService } from '../../../../shared/database/prisma.service.js';

@Injectable()
export class PrismaUserRepository extends UserRepository {
  private readonly logger = new Logger(PrismaUserRepository.name);

  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async create(userData: UserEntity): Promise<UserEntity> {
    const created = await this.prismaService.clientInstance.user.create({
      data: {
        id: userData.id,
        email: userData.email.value,
        password: userData.password?.value,
        googleId: userData.googleId?.value,
        name: userData.name,
        role: userData.role,
      },
    });

    return this.toEntity(created);
  }

  async findAll(): Promise<UserEntity[]> {
    const users = await this.prismaService.clientInstance.user.findMany();
    return users.map((user) => this.toEntity(user));
  }

  async findById(userId: UserEntity['id']): Promise<UserEntity | null> {
    const user = await this.prismaService.clientInstance.user.findUnique({
      where: { id: userId },
    });

    if (!user) return null;
    return this.toEntity(user);
  }

  async findByEmail(
    userEmail: UserEntity['email'],
  ): Promise<UserEntity | null> {
    const user = await this.prismaService.clientInstance.user.findUnique({
      where: { email: userEmail.value },
    });

    if (!user) return null;
    return this.toEntity(user);
  }

  async update(
    userId: UserEntity['id'],
    userData: UserEntity,
  ): Promise<UserEntity> {
    const updated = await this.prismaService.clientInstance.user.update({
      where: { id: userId },
      data: {
        email: userData.email.value,
        password: userData.password?.value,
        name: userData.name,
        role: userData.role,
      },
    });

    return this.toEntity(updated);
  }

  async delete(userId: UserEntity['id']): Promise<void> {
    await this.prismaService.clientInstance.user.delete({
      where: { id: userId },
    });
  }

  private toEntity(user: {
    id: string;
    email: string;
    password: string | null;
    googleId: string | null;
    name: string | null;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
  }): UserEntity {
    return new UserEntity({
      id: user.id,
      email: Email.fromValue(user.email),
      password: user.password ? Password.fromHash(user.password) : undefined,
      googleId: user.googleId ? GoogleId.fromValue(user.googleId) : undefined,
      name: user.name ?? undefined,
      role: this.fromPrismaRole(user.role),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  private fromPrismaRole(role: Role): UserRole {
    return role === Role.ADMIN ? UserRole.ADMIN : UserRole.USER;
  }
}
