import { Module } from '@nestjs/common';
import { UserController } from './presenters/http/user.http';

@Module({
  controllers: [UserController],
  providers: [],
  exports: [],
})
export class UserModule {}
