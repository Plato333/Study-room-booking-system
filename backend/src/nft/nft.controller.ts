import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NftService } from './nft.service';
import { BindWalletDto } from './dto/bind-wallet.dto';

@Controller('nft')
export class NftController {
  constructor(private readonly nftService: NftService) {}

  @Post('wallet')
  @UseGuards(AuthGuard('jwt'))
  async bindWallet(@Req() req: any, @Body() dto: BindWalletDto) {
    const wallet = await this.nftService.bindWallet(req.user.id, dto.walletAddress);
    return { code: 200, message: '钱包绑定成功', data: wallet };
  }

  @Get('wallet')
  @UseGuards(AuthGuard('jwt'))
  async getWallet(@Req() req: any) {
    const wallet = await this.nftService.getUserWallet(req.user.id);
    return { code: 200, data: wallet };
  }

  @Get('my')
  @UseGuards(AuthGuard('jwt'))
  async getMyNFTs(@Req() req: any) {
    const nfts = await this.nftService.getUserNFTs(req.user.id);
    return { code: 200, data: nfts };
  }

  @Get(':tokenId')
  @UseGuards(AuthGuard('jwt'))
  async getNFT(@Param('tokenId') tokenId: string) {
    const nft = await this.nftService.getNFT(Number(tokenId));
    return { code: 200, data: nft };
  }

  @Get('check/can-mint')
  @UseGuards(AuthGuard('jwt'))
  async canMint(@Req() req: any) {
    const result = await this.nftService.canMint(req.user.id);
    return { code: 200, data: result };
  }
}
