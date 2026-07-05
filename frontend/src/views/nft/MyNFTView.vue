<template>
  <div class="nft-page">
    <div class="page-header">
      <h2>🎨 我的 NFT 徽章</h2>
      <p class="subtitle">首次预约自习室即可获得专属 NFT 徽章，链上永久保存</p>
    </div>

    <!-- 钱包绑定区域 -->
    <el-card class="wallet-card" shadow="never">
      <div class="wallet-section">
        <div class="wallet-icon">
          <el-icon :size="32" color="#409EFF"><Wallet /></el-icon>
        </div>
        <div class="wallet-text">
          <h3>连接 MetaMask 钱包</h3>
          <p>绑定钱包后，首次预约自习室时将自动获得专属 NFT 徽章</p>
        </div>
        <WalletConnect @connected="onWalletConnected" />
      </div>
    </el-card>

    <!-- NFT 列表 -->
    <div class="nft-content">
      <div v-if="nftStore.loading" class="loading-state">
        <el-skeleton :rows="3" animated />
      </div>

      <el-empty v-else-if="nftStore.nfts.length === 0" description="还没有 NFT 徽章">
        <template #image>
          <el-icon :size="80" color="#d9d9d9"><MagicStick /></el-icon>
        </template>
        <p class="empty-hint">
          完成首次自习室预约后，你的专属 NFT 将自动铸造并显示在这里！
        </p>
        <el-button type="primary" @click="goReserve">去预约座位</el-button>
      </el-empty>

      <div v-else class="nft-grid">
        <NFTCard
          v-for="nft in nftStore.nfts"
          :key="nft.id"
          :nft="nft"
          @click="showDetail(nft)"
        />
      </div>
    </div>

    <!-- NFT 详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="`自习室徽章 #${String(detailNFT?.tokenId || '').padStart(5, '0')}`"
      width="420px"
      center
    >
      <div class="detail-content" v-if="detailNFT">
        <NFTCard :nft="detailNFT" style="margin: 0 auto" />

        <el-descriptions
          :column="1"
          border
          size="small"
          class="detail-descriptions"
        >
          <el-descriptions-item label="合约地址">
            <code class="code-text">{{ detailNFT.contractAddress }}</code>
          </el-descriptions-item>
          <el-descriptions-item label="交易哈希">
            <code class="code-text">{{ detailNFT.txHash || '待确认' }}</code>
          </el-descriptions-item>
          <el-descriptions-item label="铸造时间">
            {{ formatDate(detailNFT.mintedAt) }}
          </el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <div class="opensea-link">
          <el-button
            text
            type="primary"
            @click="openExplorer(detailNFT)"
          >
            在区块浏览器中查看
            <el-icon><Link /></el-icon>
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Wallet, Link, MagicStick } from '@element-plus/icons-vue';
import { useNftStore } from '@/stores/nft';
import WalletConnect from '@/components/nft/WalletConnect.vue';
import NFTCard from '@/components/nft/NFTCard.vue';
import type { NFTRecord } from '@/types/nft';

const router = useRouter();
const nftStore = useNftStore();

const dialogVisible = ref(false);
const detailNFT = ref<NFTRecord | null>(null);

function onWalletConnected(address: string) {
  // 钱包连接后刷新状态
  nftStore.fetchNFTs();
  nftStore.checkCanMint();
}

function goReserve() {
  router.push('/study-rooms/reserve');
}

function showDetail(nft: NFTRecord) {
  detailNFT.value = nft;
  dialogVisible.value = true;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('zh-CN');
}

function openExplorer(nft: NFTRecord) {
  // Hardhat 本地节点没有浏览器，提示用户
  alert(`NFT Token #${nft.tokenId}\n合约地址: ${nft.contractAddress}\n\n本地开发网络暂不支持区块浏览器查看。`);
}

onMounted(async () => {
  await nftStore.fetchWallet();
  await nftStore.fetchNFTs();
  await nftStore.checkCanMint();
});
</script>

<style scoped>
.nft-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0 0 8px;
  font-size: 24px;
}

.subtitle {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

/* 钱包卡片 */
.wallet-card {
  margin-bottom: 24px;
  border-radius: 12px;
  border: 1px solid #e4e7ed;
}

.wallet-section {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.wallet-icon {
  flex-shrink: 0;
}

.wallet-text {
  flex: 1;
  min-width: 200px;
}

.wallet-text h3 {
  margin: 0 0 4px;
  font-size: 16px;
}

.wallet-text p {
  margin: 0;
  font-size: 13px;
  color: #909399;
}

/* NFT 网格 */
.nft-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  justify-items: center;
}

.loading-state {
  padding: 40px;
}

.empty-hint {
  color: #909399;
  font-size: 14px;
  margin-bottom: 16px;
}

/* 详情对话框 */
.detail-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.detail-descriptions {
  width: 100%;
  margin-top: 16px;
}

.code-text {
  font-size: 11px;
  word-break: break-all;
}

.opensea-link {
  text-align: center;
}
</style>
