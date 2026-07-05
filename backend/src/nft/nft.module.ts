import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NftController } from './nft.controller';
import { NftService } from './nft.service';
import { NFTEntity } from './entities/nft.entity';
import { UserWallet } from './entities/user-wallet.entity';
import { BlockchainService } from './services/blockchain.service';
import { ImageGeneratorService } from './services/image-generator.service';
import { MetadataService } from './services/metadata.service';
import { Reservation } from '../reservations/entities/reservation.entity';
import { ReservationsModule } from '../reservations/reservations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NFTEntity, UserWallet, Reservation]),
    forwardRef(() => ReservationsModule),
  ],
  controllers: [NftController],
  providers: [
    NftService,
    BlockchainService,
    ImageGeneratorService,
    MetadataService,
  ],
  exports: [NftService],
})
export class NftModule {}
