<template>
  <div class="wallet-connect">
    <el-button
      v-if="!address"
      type="primary"
      :loading="connecting"
      @click="connectWallet"
      class="connect-btn"
    >
      <el-icon style="margin-right: 6px"><Link /></el-icon>
      连接 MetaMask
    </el-button>
    <div v-else class="wallet-info">
      <el-tag type="success" effect="dark" closable @close="disconnectWallet">
        <el-icon style="margin-right: 4px"><Wallet /></el-icon>
        {{ shortAddress }}
      </el-tag>
      <el-button
        v-if="!bound"
        type="warning"
        size="small"
        :loading="binding"
        @click="bindToServer"
        style="margin-left: 8px"
      >
        绑定到账号
      </el-button>
      <span v-else class="bound-badge">
        <el-icon color="#67C23A"><SuccessFilled /></el-icon>
        已绑定
      </span>
    </div>
    <el-alert
      v-if="error"
      :title="error"
      type="error"
      show-icon
      closable
      @close="error = ''"
      class="mt-2"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { BrowserProvider } from 'ethers';
import { Link, Wallet, SuccessFilled } from '@element-plus/icons-vue';
import { useNftStore } from '@/stores/nft';

const emit = defineEmits<{
  connected: [address: string];
}>();

const nftStore = useNftStore();

const address = ref<string>('');
const connecting = ref(false);
const binding = ref(false);
const bound = ref(false);
const error = ref('');

const shortAddress = computed(() => {
  if (!address.value) return '';
  return `${address.value.slice(0, 6)}...${address.value.slice(-4)}`;
});

/** 连接 MetaMask */
async function connectWallet() {
  if (!window.ethereum) {
    error.value = '请先安装 MetaMask 浏览器插件！';
    return;
  }

  connecting.value = true;
  error.value = '';
  try {
    const provider = new BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    address.value = accounts[0];
    emit('connected', address.value);

    // 检查是否已绑定
    await nftStore.fetchWallet();
    bound.value = !!nftStore.wallet;
  } catch (e: any) {
    error.value = e.message || '连接钱包失败';
  } finally {
    connecting.value = false;
  }
}

/** 绑定钱包到服务器 */
async function bindToServer() {
  binding.value = true;
  error.value = '';
  try {
    await nftStore.bindWallet(address.value);
    bound.value = true;
  } catch (e: any) {
    error.value = e.response?.data?.message || '绑定失败';
  } finally {
    binding.value = false;
  }
}

/** 断开钱包 */
function disconnectWallet() {
  address.value = '';
  bound.value = false;
}

/** 恢复钱包连接 */
onMounted(async () => {
  await nftStore.fetchWallet();
  if (nftStore.wallet) {
    address.value = nftStore.wallet.walletAddress;
    bound.value = true;
  }
});
</script>

<style scoped>
.wallet-connect {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
.connect-btn {
  font-size: 13px;
}
.wallet-info {
  display: flex;
  align-items: center;
}
.bound-badge {
  margin-left: 8px;
  font-size: 12px;
  color: #67c23a;
  display: flex;
  align-items: center;
  gap: 4px;
}
.mt-2 {
  margin-top: 8px;
}
</style>
