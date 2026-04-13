import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; 
import { PrismaModule } from './shared/database/prisma.module';
import {HashModule} from './shared/infrastructure/crypto/hash.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    HashModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}