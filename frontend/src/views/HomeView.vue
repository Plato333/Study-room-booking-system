<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { getProfileApi } from '@/api/auth'
import { useRouter } from 'vue-router'
import request from '@/api/index'

const userStore = useUserStore()
const router = useRouter()
const loading = ref(true)

interface Stats {
  totalSeats: number
  availableSeats: number
  occupiedSeats: number
  usageRate: number
  todayReservations: number
  todayCheckedIn: number
  checkinRate: number
  recentDaily: { date: string; count: number }[]
}

const stats = ref<Stats | null>(null)
const isAdmin = computed(() => userStore.userInfo?.role === 'admin')
const today = new Date().toISOString().slice(0, 10)

const maxDailyCount = computed(() => {
  if (!stats.value) return 1
  return Math.max(...stats.value.recentDaily.map((d) => d.count), 1)
})

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 12) return '早上好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
})

onMounted(async () => {
  try {
    const res = await getProfileApi()
    userStore.userInfo = res.data
    if (userStore.userInfo?.role === 'admin') {
      const s = await request.get('/reservations/stats')
      stats.value = s.data
    }
  } catch {
    /* */
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="home">
    <!-- Admin Apple Hero -->
    <template v-if="isAdmin && stats">
      <section class="section-hero">
        <h1 class="hero-headline">自习室<span class="hero-accent">数据</span></h1>
        <p class="hero-sub">{{ today }}</p>
        <div class="hero-cta">
          <router-link to="/study-rooms" class="button-primary">管理自习室</router-link>
          <router-link to="/study-rooms/admin-reservations" class="button-secondary">查看预约</router-link>
        </div>
      </section>

      <section class="section-grid">
        <div class="grid-col">
          <div class="grid-tile tile-purple">
            <div class="tile-icon">🏫</div>
            <div class="tile-stat">{{ stats.totalSeats }}</div>
            <div class="tile-label">总座位</div>
          </div>
          <div class="grid-tile tile-green">
            <div class="tile-icon">🟢</div>
            <div class="tile-stat">{{ stats.availableSeats }}</div>
            <div class="tile-label">空闲</div>
          </div>
        </div>
        <div class="grid-col">
          <div class="grid-tile tile-orange">
            <div class="tile-icon">🟠</div>
            <div class="tile-stat">{{ stats.occupiedSeats }}</div>
            <div class="tile-label">使用中</div>
          </div>
          <div class="grid-tile tile-blue">
            <div class="tile-icon">📊</div>
            <div class="tile-stat">{{ stats.usageRate }}%</div>
            <div class="tile-label">使用率</div>
          </div>
        </div>
        <div class="grid-col">
          <div class="grid-tile tile-pink double" @click="router.push('/study-rooms/admin-reservations')">
            <div class="tile-icon">📅</div>
            <div class="tile-stat">{{ stats.todayReservations }}</div>
            <div class="tile-label">今日预约</div>
            <div class="tile-sub">签到 {{ stats.todayCheckedIn }} · 签到率 {{ stats.checkinRate }}%</div>
          </div>
        </div>
      </section>

      <section class="section-chart">
        <div class="chart-hd">
          <h2>预约趋势</h2>
          <span>{{ stats.recentDaily.reduce((s, d) => s + d.count, 0) }} 次 · 近 7 日</span>
        </div>
        <div class="chart-bd">
          <div v-for="item in stats.recentDaily" :key="item.date" class="c-col">
            <div class="c-val">{{ item.count }}</div>
            <div class="c-track">
              <div
                class="c-fill"
                :style="{
                  height: (item.count / maxDailyCount) * 100 + '%',
                  background:
                    item.date === today
                      ? 'linear-gradient(180deg,#007aff,#40b4ff)'
                      : 'linear-gradient(180deg,#e8e8ed,#d2d2d7)',
                }"
              ></div>
            </div>
            <div class="c-lbl">{{ item.date.slice(5) }}</div>
            <div v-if="item.date === today" class="c-dot"></div>
          </div>
        </div>
      </section>
    </template>

    <!-- Student Apple Hero -->
    <template v-else-if="!loading">
      <section class="section-hero student">
        <div class="hero-emoji">{{ greeting === '夜深了' ? '🌙' : '👋' }}</div>
        <p class="hero-greeting">{{ greeting }}，{{ userStore.userInfo?.username || '同学' }}</p>
        <h1 class="hero-headline">找一个安静的<br />角落学习</h1>
        <p class="hero-sub">预约座位，专注学习</p>
        <div class="hero-cta">
          <router-link to="/study-rooms/reserve" class="button-primary">预约座位</router-link>
          <router-link to="/study-rooms/my-reservations" class="button-secondary">我的预约</router-link>
        </div>
      </section>

      <section class="section-grid half">
        <div class="grid-col">
          <div class="grid-tile tile-blue gallery" @click="router.push('/study-rooms/reserve')">
            <div class="tile-emoji">💺</div>
            <h3 class="tile-title">预约座位</h3>
            <p class="tile-desc">选择时间，找到空闲座位</p>
          </div>
        </div>
        <div class="grid-col">
          <div class="grid-tile tile-green gallery" @click="router.push('/study-rooms/my-reservations')">
            <div class="tile-emoji">📋</div>
            <h3 class="tile-title">我的预约</h3>
            <p class="tile-desc">查看记录 · 签到入场</p>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.home {
  max-width: 1068px;
  margin: 0 auto;
  padding: 0 32px;
}

.section-hero {
  padding: 80px 0 60px;
  text-align: center;
}
.section-hero.student {
  padding: 60px 0 40px;
}
.hero-emoji {
  font-size: 48px;
  margin-bottom: 8px;
}
.hero-greeting {
  font-size: 17px;
  color: var(--sk-text-secondary);
  margin-bottom: 8px;
}
.hero-headline {
  font-size: 56px;
  font-weight: 700;
  color: var(--sk-text);
  letter-spacing: -0.8px;
  line-height: 1.05;
  margin: 0 0 8px;
}
.hero-accent {
  color: var(--sk-blue);
}
.hero-sub {
  font-size: 24px;
  color: var(--sk-text-secondary);
  letter-spacing: -0.2px;
  margin: 0 0 32px;
  font-weight: 400;
}
.hero-cta {
  display: flex;
  gap: 16px;
  justify-content: center;
}
.button-primary,
.button-secondary {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 980px;
  font-size: 17px;
  font-weight: 400;
  transition: all 0.3s ease;
  cursor: pointer;
}
.button-primary {
  background: linear-gradient(135deg, #0071e3, #40b4ff);
  color: #fff;
  box-shadow: 0 4px 15px rgba(0, 113, 227, 0.25);
}
.button-primary:hover {
  box-shadow: 0 8px 30px rgba(0, 113, 227, 0.4);
  transform: translateY(-2px) scale(1.02);
}
.button-secondary {
  background: rgba(0, 0, 0, 0.04);
  color: var(--sk-text);
  border: 1px solid rgba(0, 0, 0, 0.08);
}
.button-secondary:hover {
  background: rgba(0, 0, 0, 0.08);
}

.section-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}
.section-grid.half {
  grid-template-columns: repeat(2, 1fr);
}
.grid-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.grid-tile {
  background: var(--sk-surface);
  border-radius: 18px;
  padding: 28px;
  transition: all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
  transform: perspective(800px) rotateX(0) rotateY(0);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.grid-tile:hover {
  transform: perspective(800px) rotateX(-2deg) rotateY(2deg) translateY(-4px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
}
.grid-tile.double {
  cursor: pointer;
  flex: 1;
}
.grid-tile.gallery {
  cursor: pointer;
  padding: 36px 28px;
}
.tile-icon {
  font-size: 28px;
  margin-bottom: 8px;
}
.tile-stat {
  font-size: 40px;
  font-weight: 700;
  color: var(--sk-text);
  letter-spacing: -0.8px;
  line-height: 1;
}
.tile-label {
  font-size: 14px;
  color: var(--sk-text-secondary);
  margin-top: 4px;
}
.tile-sub {
  font-size: 12px;
  color: var(--sk-text-tertiary);
  margin-top: 6px;
}
.tile-emoji {
  font-size: 36px;
  margin-bottom: 12px;
}
.tile-title {
  font-size: 21px;
  font-weight: 700;
  color: var(--sk-text);
  margin: 0 0 4px;
  letter-spacing: -0.3px;
}
.tile-desc {
  font-size: 14px;
  color: var(--sk-text-secondary);
  margin: 0;
}

.tile-purple {
  border-top: 3px solid #af52de;
}
.tile-green {
  border-top: 3px solid #34c759;
}
.tile-orange {
  border-top: 3px solid #ff9500;
}
.tile-blue {
  border-top: 3px solid #007aff;
}
.tile-pink {
  border-top: 3px solid #ff2d55;
}

.section-chart {
  background: var(--sk-surface);
  border-radius: 18px;
  padding: 28px 32px;
  margin-bottom: 40px;
}
.chart-hd {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}
.chart-hd h2 {
  font-size: 21px;
  font-weight: 700;
  color: var(--sk-text);
  margin: 0;
  letter-spacing: -0.3px;
}
.chart-hd span {
  font-size: 14px;
  color: var(--sk-text-tertiary);
}
.chart-bd {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 200px;
  gap: 20px;
}
.c-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
}
.c-val {
  font-size: 13px;
  font-weight: 600;
  color: var(--sk-text-secondary);
  margin-bottom: 8px;
}
.c-track {
  width: 48px;
  flex: 1;
  background: #f5f5f7;
  border-radius: 24px;
  overflow: hidden;
  position: relative;
}
.c-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  border-radius: 24px;
  transition: height 1s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 4px;
}
.c-lbl {
  font-size: 12px;
  color: var(--sk-text-tertiary);
  margin-top: 10px;
  font-weight: 500;
}
.c-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--sk-blue);
  position: absolute;
  bottom: -8px;
}
</style>
