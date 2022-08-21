import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserSchema } from 'src/db/schema/user';
import { UserService } from './user.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/config/config.jwt';
import { JwtStrategy } from './jwt.strategy';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Users', schema: UserSchema }]),
    JwtModule.register({
      secret: jwtConstants.secret, // 密钥
      signOptions: { expiresIn: '1h' }, // token 过期时效
    }),
  ],
  controllers: [UserController],
  providers: [UserService,JwtStrategy],
})
export class UserModule {}
