import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { IConfig } from 'src/config/config.interface';

export const setupMongodb = () => {
  // 从configService中获取环境变量，并连接mongo
  return MongooseModule.forRootAsync({
    imports: [ConfigModule],
    useFactory: (configService: ConfigService<IConfig>) => {
      const mongooseOptions: MongooseModuleOptions = {
        uri: configService.get('MONGO_URI'),
        dbName: configService.get('MONGO_DB_NAME'),
        user: configService.get('MONGO_USER'),
        pass: configService.get('MONGO_PASS'),
        authSource: configService.get('MONGO_AUTH_SOURCE'),
      };
      return mongooseOptions;
    },
    inject: [ConfigService],
  });
};
