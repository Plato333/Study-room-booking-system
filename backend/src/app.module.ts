import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { User } from './users/entities/user.entity'
import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.module'
import { StudyRoom } from './study-rooms/entities/study-room.entity'
import { StudyRoomsModule } from './study-rooms/study-rooms.module'
import { Seat } from './seats/entities/seat.entity'
import { SeatsModule } from './seats/seats.module'
import { Reservation } from './reservations/entities/reservation.entity'
import { ReservationsModule } from './reservations/reservations.module'
import { AiModule } from './ai/ai.module'
import { NftModule } from './nft/nft.module'
import { NFTEntity } from './nft/entities/nft.entity'
import { UserWallet } from './nft/entities/user-wallet.entity'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get<string>('DB_USERNAME', 'root'),
        password: configService.get<string>('DB_PASSWORD', 'root'),
        database: configService.get<string>('DB_DATABASE', 'rainier_training'),
        entities: [User, StudyRoom, Seat, Reservation, NFTEntity, UserWallet],
        synchronize: true,
      }),
    }),
    UsersModule,
    AuthModule,
    StudyRoomsModule,
    SeatsModule,
    ReservationsModule,
    AiModule,
    NftModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
