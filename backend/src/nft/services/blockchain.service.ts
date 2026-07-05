import { Injectable, Logger } from '@nestjs/common';
import { JsonRpcProvider, Wallet, Contract } from 'ethers';
import * as contractJson from '../contracts/StudyRoomBadge.json';

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: JsonRpcProvider;
  private signer: Wallet;
  private contract: Contract;

  constructor() {
    this.init();
  }

  private init() {
    const rpcUrl = process.env.NFT_RPC_URL || 'http://127.0.0.1:8545';
    const privateKey =
      process.env.NFT_PRIVATE_KEY ||
      '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

    const { contractAddress, abi } = contractJson as any;

    this.provider = new JsonRpcProvider(rpcUrl);
    this.signer = new Wallet(privateKey, this.provider);
    this.contract = new Contract(contractAddress, JSON.parse(abi), this.signer);

    this.logger.log(`BlockchainService 初始化完成`);
    this.logger.log(`   RPC: ${rpcUrl}`);
    this.logger.log(`   合约: ${contractAddress}`);
    this.logger.log(`   签名者: ${this.signer.address}`);
  }

  /**
   * 铸造 NFT
   * @param to 接收者钱包地址
   * @param tokenURI 元数据 URI
   * @returns tokenId 和交易哈希
   */
  async mint(to: string, tokenURI: string): Promise<{ tokenId: number; txHash: string }> {
    this.logger.log(`铸造 NFT → ${to}`);

    const tx = await this.contract.safeMint(to, tokenURI);
    const receipt = await tx.wait();

    // 从事件中解析 tokenId
    const event = receipt.logs
      .map((log: any) => {
        try {
          return this.contract.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((parsed: any) => parsed?.name === 'BadgeMinted');

    let tokenId: number;
    if (event && event.args) {
      tokenId = Number(event.args.tokenId);
    } else {
      // fallback: 直接查询用户 token
      const balance = await this.contract.balanceOf(to);
      tokenId = Number(await this.contract.tokenOfOwnerByIndex(to, balance - 1n));
    }

    this.logger.log(`铸造成功 → Token #${tokenId}, Tx: ${receipt.hash}`);

    return {
      tokenId,
      txHash: receipt.hash,
    };
  }

  /**
   * 查询某个地址是否已铸造
   */
  async hasMinted(address: string): Promise<boolean> {
    return this.contract.hasMinted(address);
  }

  /**
   * 查询总铸造数量
   */
  async totalMinted(): Promise<number> {
    return Number(await this.contract.totalMinted());
  }

  /**
   * 获取合约地址
   */
  getContractAddress(): string {
    return this.contract.target as string;
  }

  /**
   * 获取链 ID
   */
  getChainId(): number {
    return Number(process.env.NFT_CHAIN_ID) || 31337;
  }
}
