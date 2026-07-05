<script setup lang="ts">
import AppHeader from './AppHeader.vue'
</script>

<template>
  <div class="app-layout">
    <!-- 3D 浮动几何体 -->
    <div class="morph-shape s1"></div>
    <div class="morph-shape s2"></div>
    <div class="morph-shape s3"></div>
    <div class="morph-shape s4"></div>
    <div class="morph-shape s5"></div>

    <!-- 浮动圆环 -->
    <div class="ring r1"></div>
    <div class="ring r2"></div>
    <div class="ring r3"></div>
    <div class="ring r4"></div>
    <div class="ring r5"></div>
    <div class="ring r6"></div>
    <div class="ring r7"></div>
    <div class="ring r8"></div>
    <div class="ring r9"></div>

    <!-- 光晕 -->
    <div class="glow-bg"></div>

    <el-header height="60px" class="app-header">
      <AppHeader />
    </el-header>
    <el-main class="app-main">
      <router-view />
    </el-main>
  </div>
</template>

<style scoped>
.app-layout {
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  background: #f5f5f7;
}

.app-header {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: saturate(180%) blur(24px);
  -webkit-backdrop-filter: saturate(180%) blur(24px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  padding: 0 28px;
  height: 60px !important;
  flex-shrink: 0;
  position: relative;
  z-index: 10;
}

.app-main {
  overflow-y: auto;
  flex: 1;
  position: relative;
  z-index: 1;
  background: transparent;
}

/* === Morphing 3D Shapes === */
.morph-shape {
  position: fixed;
  border-radius: 50%;
  will-change: transform, border-radius;
  z-index: 0;
  pointer-events: none;
  mix-blend-mode: overlay;
}

.s1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(0, 113, 227, 0.08) 0%, transparent 70%);
  top: -100px;
  left: -100px;
  animation:
    morph1 18s ease-in-out infinite,
    float3d1 12s ease-in-out infinite;
}
.s2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(175, 82, 222, 0.06) 0%, transparent 70%);
  bottom: -80px;
  right: -80px;
  animation:
    morph2 22s ease-in-out infinite,
    float3d2 15s ease-in-out infinite;
}
.s3 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255, 45, 85, 0.05) 0%, transparent 70%);
  top: 50%;
  left: 60%;
  animation:
    morph3 20s ease-in-out infinite,
    float3d3 10s ease-in-out infinite;
}
.s4 {
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(52, 199, 89, 0.06) 0%, transparent 70%);
  top: 20%;
  left: 80%;
  animation:
    morph4 16s ease-in-out infinite,
    float3d4 14s ease-in-out infinite;
}
.s5 {
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, rgba(255, 149, 0, 0.05) 0%, transparent 70%);
  top: 60%;
  left: -50px;
  animation:
    morph5 24s ease-in-out infinite,
    float3d5 18s ease-in-out infinite;
}

/* Morphing keyframes - shapes morph between circle, oval, blob */
@keyframes morph1 {
  0%,
  100% {
    border-radius: 50%;
    transform: scale(1) rotate(0deg);
  }
  25% {
    border-radius: 40% 60% 60% 40%;
    transform: scale(1.1) rotate(15deg);
  }
  50% {
    border-radius: 30% 70% 40% 60%;
    transform: scale(0.95) rotate(-10deg);
  }
  75% {
    border-radius: 60% 40% 30% 70%;
    transform: scale(1.05) rotate(8deg);
  }
}
@keyframes morph2 {
  0%,
  100% {
    border-radius: 50%;
    transform: scale(1) rotate(0deg);
  }
  33% {
    border-radius: 50% 30% 70% 50%;
    transform: scale(1.15) rotate(-12deg);
  }
  66% {
    border-radius: 70% 50% 40% 60%;
    transform: scale(0.9) rotate(10deg);
  }
}
@keyframes morph3 {
  0%,
  100% {
    border-radius: 60% 40% 50% 50%;
  }
  50% {
    border-radius: 40% 60% 30% 70%;
    transform: scale(1.2);
  }
}
@keyframes morph4 {
  0%,
  100% {
    border-radius: 40% 60%;
  }
  50% {
    border-radius: 60% 40%;
  }
}
@keyframes morph5 {
  0%,
  100% {
    border-radius: 50% 50% 50% 30%;
  }
  33% {
    border-radius: 30% 70% 60% 40%;
  }
  66% {
    border-radius: 70% 30% 40% 60%;
  }
}

/* 3D floating */
@keyframes float3d1 {
  0%,
  100% {
    transform: translateY(0) translateZ(0);
  }
  50% {
    transform: translateY(-30px) translateZ(50px);
  }
}
@keyframes float3d2 {
  0%,
  100% {
    transform: translateY(0) translateZ(0);
  }
  50% {
    transform: translateY(20px) translateZ(-30px);
  }
}
@keyframes float3d3 {
  0%,
  100% {
    transform: translateY(0) translateZ(0);
  }
  50% {
    transform: translateY(-20px) translateZ(40px);
  }
}
@keyframes float3d4 {
  0%,
  100% {
    transform: translateY(0) translateZ(0);
  }
  50% {
    transform: translateY(15px) translateZ(-20px);
  }
}
@keyframes float3d5 {
  0%,
  100% {
    transform: translateY(0) translateZ(0);
  }
  50% {
    transform: translateY(-25px) translateZ(60px);
  }
}

/* === Floating Rings === */
.ring {
  position: fixed; border-radius: 50%;
  z-index: 0; pointer-events: none;
  mix-blend-mode: multiply;
}
.r1 { width:280px;height:280px;top:10%;left:15%;border:4px solid rgba(0,113,227,.25);box-shadow:0 0 40px rgba(0,113,227,.12),inset 0 0 40px rgba(0,113,227,.06);animation:ringSpin 20s linear infinite,ringFloat 7s ease-in-out infinite; }
.r2 { width:220px;height:220px;top:70%;left:70%;border:3px solid rgba(175,82,222,.25);box-shadow:0 0 35px rgba(175,82,222,.12),inset 0 0 35px rgba(175,82,222,.06);animation:ringSpin 18s linear infinite reverse,ringFloat2 9s ease-in-out infinite; }
.r3 { width:160px;height:160px;top:30%;left:80%;border:3px solid rgba(52,199,89,.25);box-shadow:0 0 30px rgba(52,199,89,.12),inset 0 0 30px rgba(52,199,89,.06);animation:ringSpin 14s linear infinite,ringFloat3 6s ease-in-out infinite; }
.r4 { width:120px;height:120px;top:5%;left:55%;border:3px solid rgba(255,149,0,.25);box-shadow:0 0 25px rgba(255,149,0,.12),inset 0 0 25px rgba(255,149,0,.06);animation:ringSpin 12s linear infinite reverse,ringFloat4 8s ease-in-out infinite; }
.r5 { width:320px;height:320px;top:45%;left:-5%;border:5px solid rgba(0,113,227,.2);box-shadow:0 0 50px rgba(0,113,227,.1),inset 0 0 50px rgba(0,113,227,.05);animation:ringSpin 30s linear infinite,ringFloat5 10s ease-in-out infinite; }
.r6 { width:90px;height:90px;top:85%;left:25%;border:3px solid rgba(255,45,85,.3);box-shadow:0 0 20px rgba(255,45,85,.15),inset 0 0 20px rgba(255,45,85,.08);animation:ringSpin 10s linear infinite,ringFloat6 5s ease-in-out infinite; }
.r7 { width:360px;height:360px;top:-8%;left:-10%;border:2px solid rgba(175,82,222,.2);box-shadow:0 0 60px rgba(175,82,222,.1),inset 0 0 60px rgba(175,82,222,.05);animation:ringSpin 40s linear infinite reverse,ringFloat7 12s ease-in-out infinite; }
.r8 { width:140px;height:140px;top:25%;left:40%;border:3px solid rgba(52,199,89,.2);box-shadow:0 0 20px rgba(52,199,89,.1),inset 0 0 20px rgba(52,199,89,.05);animation:ringSpin 16s linear infinite,ringFloat8 7s ease-in-out infinite; }
.r9 { width:60px;height:60px;top:60%;left:50%;border:3px solid rgba(0,113,227,.35);box-shadow:0 0 15px rgba(0,113,227,.2),inset 0 0 15px rgba(0,113,227,.1);animation:ringSpin 8s linear infinite reverse,ringFloat9 4s ease-in-out infinite; }

@keyframes ringSpin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
@keyframes ringFloat{0%,100%{transform:translateY(0)scale(1)}50%{transform:translateY(-35px)scale(1.05)}}
@keyframes ringFloat2{0%,100%{transform:translateY(0)scale(1)}50%{transform:translateY(30px)scale(1.05)}}
@keyframes ringFloat3{0%,100%{transform:translateY(0)}50%{transform:translateY(-22px)}}
@keyframes ringFloat4{0%,100%{transform:translateY(0)}50%{transform:translateY(-18px)}}
@keyframes ringFloat5{0%,100%{transform:translateY(0)scale(1)}50%{transform:translateY(40px)scale(1.08)}}
@keyframes ringFloat6{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
@keyframes ringFloat7{0%,100%{transform:translateY(0)scale(1)}50%{transform:translateY(-28px)scale(1.06)}}
@keyframes ringFloat8{0%,100%{transform:translateY(0)}50%{transform:translateY(20px)}}
@keyframes ringFloat9{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
/* === Overall Glow === */
.glow-bg {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse at 20% 20%, rgba(0, 113, 227, 0.03) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 80%, rgba(175, 82, 222, 0.03) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(255, 45, 85, 0.02) 0%, transparent 50%);
  z-index: 0;
  pointer-events: none;
}
</style>
