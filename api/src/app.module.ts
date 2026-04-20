import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './shared/database/prisma.module';
import { HashModule } from './shared/infrastructure/crypto/hash.module';
import { UserModule } from './modules/users/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    HashModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
