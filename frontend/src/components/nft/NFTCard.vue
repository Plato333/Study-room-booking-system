<template>
  <div class="nft-card" :style="{ '--hue': hue }">
    <div class="nft-card-inner">
      <!-- 徽章图标区域 -->
      <div class="nft-header">
        <span class="nft-title">✦ STUDY ROOM BADGE</span>
      </div>

      <!-- 图片区域 -->
      <div class="nft-image-wrapper">
        <div class="nft-icon">
          <span class="icon-emoji">{{ iconEmoji }}</span>
        </div>
      </div>

      <!-- 属性信息 -->
      <div class="nft-body">
        <div class="nft-motto">「学海无涯，砥砺前行」</div>
        <el-divider style="margin: 10px 0; border-color: rgba(255,255,255,0.2)" />

        <div class="nft-attributes">
          <div class="attr-row">
            <span class="attr-label">自习室</span>
            <span class="attr-value">{{ nft.studyRoomName }}</span>
          </div>
          <div class="attr-row">
            <span class="attr-label">座位号</span>
            <span class="attr-value">{{ nft.seatNumber }}</span>
          </div>
          <div class="attr-row">
            <span class="attr-label">预约日期</span>
            <span class="attr-value">{{ nft.reservationDate }}</span>
          </div>
          <div class="attr-row">
            <span class="attr-label">编号</span>
            <span class="attr-value token-id">#{{ String(nft.tokenId).padStart(5, '0') }}</span>
          </div>
        </div>
      </div>

      <!-- 底部 -->
      <div class="nft-footer">
        <div class="footer-label">区块链标识</div>
        <div class="footer-chain">ERC-721 · Localhost Chain</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { NFTRecord } from '@/types/nft';

const props = defineProps<{
  nft: NFTRecord;
}>();

// 基于 Token ID 的 HSL 色相
const hue = computed(() => (props.nft.tokenId * 137.508) % 360);

// 基于自习室名称的图标
const iconEmoji = computed(() => {
  const hash = simpleHash(props.nft.studyRoomName);
  const icons = ['📚', '🏛️', '⭐', '🏆', '🔑', '👑'];
  return icons[hash % icons.length];
});

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}
</script>

<style scoped>
.nft-card {
  width: 340px;
  border-radius: 20px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.nft-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
}

.nft-card-inner {
  background: linear-gradient(135deg, hsl(var(--hue, 200), 65%, 55%), hsl(calc(var(--hue, 200) + 45), 70%, 45%));
  border: 3px solid;
  border-image: linear-gradient(135deg, #FFD700, #FFA500, #FFD700) 1;
}

.nft-header {
  padding: 16px 20px 8px;
  text-align: center;
}

.nft-title {
  font-size: 14px;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 3px;
}

.nft-image-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 0;
}

.nft-icon {
  width: 100px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  border: 2px solid rgba(255, 215, 0, 0.5);
}

.icon-emoji {
  font-size: 48px;
}

.nft-body {
  padding: 0 20px 16px;
}

.nft-motto {
  text-align: center;
  font-family: Georgia, serif;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  font-style: italic;
}

.nft-attributes {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attr-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.attr-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: bold;
}

.attr-value {
  font-size: 13px;
  color: #ffffff;
  font-weight: bold;
}

.token-id {
  color: hsl(calc(var(--hue, 200) + 180), 80%, 60%);
  font-size: 15px;
}

.nft-footer {
  padding: 12px 20px;
  background: rgba(0, 0, 0, 0.15);
  text-align: center;
}

.footer-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
}

.footer-chain {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: bold;
}
</style>
