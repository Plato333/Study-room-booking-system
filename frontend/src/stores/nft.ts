import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  bindWalletApi,
  getWalletApi,
  getMyNFTsApi,
  canMintApi,
} from '@/api/nft';
import type { NFTRecord, UserWallet } from '@/types/nft';

export const useNftStore = defineStore('nft', () => {
  const nfts = ref<NFTRecord[]>([]);
  const wallet = ref<UserWallet | null>(null);
  const canMint = ref<boolean>(false);
  const mintReason = ref<string>('');
  const loading = ref(false);

  /** 绑定钱包 */
  async function bindWallet(address: string) {
    await bindWalletApi(address);
    wallet.value = { walletAddress: address };
  }

  /** 获取用户钱包 */
  async function fetchWallet() {
    try {
      const res = await getWalletApi();
      wallet.value = res.data || null;
    } catch {
      wallet.value = null;
    }
  }

  /** 获取 NFT 列表 */
  async function fetchNFTs() {
    loading.value = true;
    try {
      const res = await getMyNFTsApi();
      nfts.value = res.data || [];
    } finally {
      loading.value = false;
    }
  }

  /** 检查是否可以铸造 */
  async function checkCanMint() {
    try {
      const res = await canMintApi();
      canMint.value = res.data.canMint;
      mintReason.value = res.data.reason || '';
    } catch {
      canMint.value = false;
      mintReason.value = '';
    }
  }

  return {
    nfts,
    wallet,
    canMint,
    mintReason,
    loading,
    bindWallet,
    fetchWallet,
    fetchNFTs,
    checkCanMint,
  };
});
