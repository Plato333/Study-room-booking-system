import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NFTEntity } from './entities/nft.entity';
import { UserWallet } from './entities/user-wallet.entity';
import { BlockchainService } from './services/blockchain.service';
import { ImageGeneratorService } from './services/image-generator.service';
import { MetadataService } from './services/metadata.service';
import { User } from '../users/entities/user.entity';
import { Reservation } from '../reservations/entities/reservation.entity';

@Injectable()
export class NftService {
  private readonly logger = new Logger(NftService.name);

  constructor(
    @InjectRepository(NFTEntity)
    private nftRepo: Repository<NFTEntity>,
    @InjectRepository(UserWallet)
    private walletRepo: Repository<UserWallet>,
    @InjectRepository(Reservation)
    private reservationRepo: Repository<Reservation>,
    private blockchainService: BlockchainService,
    private imageGeneratorService: ImageGeneratorService,
    private metadataService: MetadataService,
  ) {}

  /**
   * 绑定用户钱包地址
   */
  async bindWallet(userId: number, walletAddress: string): Promise<UserWallet> {
    const existing = await this.walletRepo.findOne({ where: { userId } });
    if (existing) {
      throw new BadRequestException('用户已绑定钱包地址');
    }

    const wallet = this.walletRepo.create({ userId, walletAddress });
    return this.walletRepo.save(wallet);
  }

  /**
   * 获取用户绑定的钱包
   */
  async getUserWallet(userId: number): Promise<UserWallet | null> {
    return this.walletRepo.findOne({ where: { userId } });
  }

  /**
   * 为用户铸造 NFT（首次预约时调用）
   */
  async mintNFT(
    userId: number,
    username: string,
    reservationData: {
      studyRoomName: string;
      seatNumber: string;
      reservationDate: string;
    },
  ): Promise<NFTEntity> {
    // 1. 检查是否已有 NFT
    const existingNft = await this.nftRepo.findOne({ where: { userId } });
    if (existingNft) {
      throw new BadRequestException('用户已拥有 NFT 徽章');
    }

    // 2. 获取用户钱包
    const wallet = await this.walletRepo.findOne({ where: { userId } });
    if (!wallet) {
      throw new BadRequestException('请先绑定 MetaMask 钱包地址');
    }

    // 3. 检查链上是否已铸造
    const hasOnChain = await this.blockchainService.hasMinted(wallet.walletAddress);
    if (hasOnChain) {
      throw new BadRequestException('该钱包地址已在链上铸造过 NFT');
    }

    try {
      // 4. 生成数据
      const chainId = this.blockchainService.getChainId();
      const contractAddress = this.blockchainService.getContractAddress();

      // 5. 生成徽章 SVG 图片
      const svg = this.imageGeneratorService.generateBadgeSVG({
        tokenId: 0, // 占位，后续更新
        username,
        studyRoomName: reservationData.studyRoomName,
        seatNumber: reservationData.seatNumber,
        reservationDate: reservationData.reservationDate,
      });

      // 6. 上传图片到 IPFS（或使用 data URI）
      const imageUri = await this.metadataService.uploadImageToIPFS(
        svg,
        `badge-${userId}.svg`,
      );

      // 7. 构建元数据
      const metadata = this.metadataService.buildMetadata({
        name: `自习室徽章 #${username}`,
        description: `这是 ${username} 在「${reservationData.studyRoomName}」自习室首次预约获得的专属 NFT 徽章，记录于 ${reservationData.reservationDate}。`,
        image: imageUri,
        attributes: [
          { trait_type: '自习室', value: reservationData.studyRoomName },
          { trait_type: '座位号', value: reservationData.seatNumber },
          { trait_type: '预约日期', value: reservationData.reservationDate },
          { trait_type: '持有者', value: username },
          { trait_type: '链', value: `Chain ID: ${chainId}` },
        ],
      });

      // 8. 上传元数据到 IPFS
      const metadataUri = await this.metadataService.uploadMetadataToIPFS(
        metadata,
        `metadata-${userId}.json`,
      );

      // 9. 在区块链上铸造
      const { tokenId, txHash } = await this.blockchainService.mint(
        wallet.walletAddress,
        metadataUri,
      );

      // 10. 更新 SVG 中的 Token ID 并重新上传（或忽略）
      const finalImageUri = imageUri;

      // 11. 保存到数据库
      const nft = this.nftRepo.create({
        userId,
        tokenId,
        contractAddress,
        txHash,
        metadataUri,
        imageUri: finalImageUri,
        chainId,
        studyRoomName: reservationData.studyRoomName,
        seatNumber: reservationData.seatNumber,
        reservationDate: reservationData.reservationDate,
      });

      const savedNft = await this.nftRepo.save(nft);
      this.logger.log(`NFT #${tokenId} 铸造成功 → 用户 #${userId}`);

      return savedNft;
    } catch (error: any) {
      this.logger.error('NFT 铸造失败', error);
      throw new InternalServerErrorException(`NFT 铸造失败: ${error.message}`);
    }
  }

  /**
   * 获取用户的 NFT 列表
   */
  async getUserNFTs(userId: number): Promise<NFTEntity[]> {
    return this.nftRepo.find({
      where: { userId },
      order: { mintedAt: 'DESC' },
    });
  }

  /**
   * 获取单个 NFT 详情
   */
  async getNFT(tokenId: number): Promise<NFTEntity> {
    const nft = await this.nftRepo.findOne({ where: { tokenId } });
    if (!nft) {
      throw new NotFoundException('NFT 不存在');
    }
    return nft;
  }

  /**
   * 检查用户是否满足铸造条件（首次预约且无 NFT）
   */
  async canMint(userId: number): Promise<{ canMint: boolean; reason?: string }> {
    // 检查是否已绑定钱包
    const wallet = await this.walletRepo.findOne({ where: { userId } });
    if (!wallet) {
      return { canMint: false, reason: '请先绑定 MetaMask 钱包' };
    }

    // 检查是否已有 NFT
    const existingNft = await this.nftRepo.findOne({ where: { userId } });
    if (existingNft) {
      return { canMint: false, reason: '已拥有 NFT 徽章' };
    }

    return { canMint: true };
  }
}
