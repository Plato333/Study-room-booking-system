import request from './index';

/** 绑定钱包地址 */
export const bindWalletApi = (walletAddress: string) =>
  request.post('/nft/wallet', { walletAddress });

/** 获取用户绑定的钱包 */
export const getWalletApi = () => request.get('/nft/wallet');

/** 获取我的 NFT 列表 */
export const getMyNFTsApi = () => request.get('/nft/my');

/** 获取单个 NFT 详情 */
export const getNFTDetailApi = (tokenId: number) =>
  request.get(`/nft/${tokenId}`);

/** 检查是否可以铸造 NFT */
export const canMintApi = () => request.get('/nft/check/can-mint');
