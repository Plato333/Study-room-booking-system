import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class BindWalletDto {
  @IsNotEmpty({ message: '钱包地址不能为空' })
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: '无效的钱包地址格式' })
  walletAddress: string;
}
