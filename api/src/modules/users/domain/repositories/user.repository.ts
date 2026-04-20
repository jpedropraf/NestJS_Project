import { UserEntity } from '../entities/user.entity.js';

export abstract class UserRepository {
  abstract create(user_data: UserEntity): Promise<UserEntity>;
  abstract findAll(): Promise<UserEntity[]>;
  abstract findById(user_id: UserEntity['id']): Promise<UserEntity | null>;
  abstract findByEmail(
    user_email: UserEntity['email'],
  ): Promise<UserEntity | null>;
  abstract update(
    user_id: UserEntity['id'],
    user_data: UserEntity,
  ): Promise<UserEntity>;
  abstract delete(user_id: UserEntity['id']): Promise<void>;
}
