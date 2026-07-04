import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserModule } from './user/user.module';
import { OrderModule } from './order/order.module';
import { DatabaseService } from './db.service';
import { TrizModule } from './triz/triz.module';
import { GoogleModule } from './google/google.module';
import { TopologyModule } from './topology/topology.module';
import { ArenaModule } from './arena/arena.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    OrderModule,
    TrizModule,
    GoogleModule,
    TopologyModule,
    ArenaModule,
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get<string>('DB_HOST') || 'localhost',
        port: configService.get<number>('DB_PORT') || 5432,
        username: configService.get<string>('DB_USERNAME') || 'postgres',
        password: configService.get<string>('DB_PASSWORD') || 'postgres',
        database: configService.get<string>('DB_NAME') || 'nestDb',
        models: [],
        autoLoadModels: true,
        synchronize: false,
      }),
    }),
  ],
  controllers: [],
  providers: [DatabaseService],
})
export class AppModule {}

