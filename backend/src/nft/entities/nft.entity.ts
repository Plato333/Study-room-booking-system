import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('nfts')
export class NFTEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'token_id' })
  tokenId: number;

  @Column({ name: 'contract_address', length: 42 })
  contractAddress: string;

  @Column({ name: 'tx_hash', length: 66, nullable: true })
  txHash: string;

  @Column({ name: 'metadata_uri', length: 500, nullable: true })
  metadataUri: string;

  @Column({ name: 'image_uri', length: 500, nullable: true })
  imageUri: string;

  @Column({ name: 'chain_id' })
  chainId: number;

  @Column({ name: 'study_room_name', length: 100 })
  studyRoomName: string;

  @Column({ name: 'seat_number', length: 20 })
  seatNumber: string;

  @Column({ name: 'reservation_date', type: 'date' })
  reservationDate: string;

  @CreateDateColumn({ name: 'minted_at' })
  mintedAt: Date;
}
