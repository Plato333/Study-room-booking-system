import { Injectable, Logger } from '@nestjs/common';

/**
 * NFT 徽章图片生成服务
 * 使用 SVG 生成独特的自习室徽章，无需任何原生依赖
 * 每个徽章的背景色基于 Token ID 动态生成 HSL 色值
 */
@Injectable()
export class ImageGeneratorService {
  private readonly logger = new Logger(ImageGeneratorService.name);

  /**
   * 生成 NFT 徽章 SVG
   */
  generateBadgeSVG(params: {
    tokenId: number;
    username: string;
    studyRoomName: string;
    seatNumber: string;
    reservationDate: string;
  }): string {
    const { tokenId, username, studyRoomName, seatNumber, reservationDate } = params;

    // 基于 Token ID 生成唯一的 HSL 色相
    const hue = (tokenId * 137.508) % 360; // 黄金角分布，确保色彩均匀
    const bgColor1 = `hsl(${hue}, 65%, 55%)`;
    const bgColor2 = `hsl(${(hue + 45) % 360}, 70%, 45%)`;
    const accentColor = `hsl(${(hue + 180) % 360}, 80%, 60%)`;

    // 基于自习室名称生成图标
    const icon = this.generateRoomIcon(studyRoomName, accentColor);

    return `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="700" viewBox="0 0 500 700">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bgColor1}"/>
      <stop offset="100%" style="stop-color:${bgColor2}"/>
    </linearGradient>
    <linearGradient id="border" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFD700"/>
      <stop offset="50%" style="stop-color:#FFA500"/>
      <stop offset="100%" style="stop-color:#FFD700"/>
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.3"/>
    </filter>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- 卡片背景 -->
  <rect x="0" y="0" width="500" height="700" rx="24" ry="24" fill="url(#bg)" filter="url(#shadow)"/>

  <!-- 金色边框 -->
  <rect x="6" y="6" width="488" height="688" rx="20" ry="20" fill="none" stroke="url(#border)" stroke-width="3" opacity="0.8"/>

  <!-- 顶部标题 -->
  <text x="250" y="60" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="#FFFFFF" text-anchor="middle" letter-spacing="4">✦ STUDY ROOM BADGE ✦</text>

  <!-- 装饰线 -->
  <line x1="60" y1="80" x2="440" y2="80" stroke="rgba(255,255,255,0.4)" stroke-width="1"/>

  <!-- 自习室图标 -->
  ${icon}

  <!-- 座右铭 -->
  <text x="250" y="240" font-family="Georgia, serif" font-size="14" fill="rgba(255,255,255,0.8)" text-anchor="middle" font-style="italic">「学海无涯，砥砺前行」</text>

  <!-- 分隔线 -->
  <line x1="40" y1="265" x2="460" y2="265" stroke="rgba(255,255,255,0.3)" stroke-width="1" stroke-dasharray="6,4"/>

  <!-- 属性列表 -->
  <g font-family="Arial, sans-serif" font-size="14">
    <!-- 自习室 -->
    <text x="60" y="305" fill="rgba(255,255,255,0.6)" font-weight="bold">自习室</text>
    <text x="60" y="325" fill="#FFFFFF" font-size="16" font-weight="bold">${this.escapeXml(studyRoomName)}</text>

    <!-- 座位号 -->
    <text x="60" y="375" fill="rgba(255,255,255,0.6)" font-weight="bold">座位号</text>
    <text x="60" y="395" fill="#FFFFFF" font-size="16" font-weight="bold">${this.escapeXml(seatNumber)}</text>

    <!-- 预约日期 -->
    <text x="60" y="445" fill="rgba(255,255,255,0.6)" font-weight="bold">预约日期</text>
    <text x="60" y="465" fill="#FFFFFF" font-size="16" font-weight="bold">${this.escapeXml(reservationDate)}</text>

    <!-- Token ID -->
    <text x="60" y="515" fill="rgba(255,255,255,0.6)" font-weight="bold">编号</text>
    <text x="60" y="535" fill="${accentColor}" font-size="18" font-weight="bold">#${String(tokenId).padStart(5, '0')}</text>
  </g>

  <!-- 底部持有者信息 -->
  <rect x="40" y="580" width="420" height="60" rx="12" fill="rgba(0,0,0,0.15)"/>
  <text x="250" y="605" font-family="Arial, sans-serif" font-size="11" fill="rgba(255,255,255,0.5)" text-anchor="middle">持有者</text>
  <text x="250" y="625" font-family="Arial, sans-serif" font-size="14" fill="#FFFFFF" text-anchor="middle" font-weight="bold">${this.escapeXml(username)}</text>

  <!-- 区块链标识 -->
  <text x="250" y="670" font-family="Arial, sans-serif" font-size="10" fill="rgba(255,255,255,0.35)" text-anchor="middle">ERC-721 · Localhost Chain</text>
</svg>`;
  }

  /**
   * 生成自习室图标
   */
  private generateRoomIcon(roomName: string, accentColor: string): string {
    // 基于自习室名称生成一个简单的哈希来决定图标
    const hash = this.simpleHash(roomName);
    const iconType = hash % 6;

    const icons = [
      // 书本图标
      `<g transform="translate(250, 150)">
        <rect x="-30" y="-20" width="60" height="45" rx="5" fill="rgba(255,255,255,0.2)" stroke="${accentColor}" stroke-width="2"/>
        <line x1="-15" y1="-5" x2="15" y2="-5" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
        <line x1="-15" y1="5" x2="15" y2="5" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
        <line x1="-15" y1="15" x2="5" y2="15" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
        <text x="0" y="-30" font-family="Arial, sans-serif" font-size="12" fill="rgba(255,255,255,0.6)" text-anchor="middle">📚</text>
      </g>`,
      // 建筑图标
      `<g transform="translate(250, 150)">
        <rect x="-25" y="-30" width="50" height="55" rx="3" fill="rgba(255,255,255,0.2)" stroke="${accentColor}" stroke-width="2"/>
        <rect x="-8" y="10" width="16" height="15" rx="2" fill="${accentColor}"/>
        <text x="0" y="-38" font-family="Arial, sans-serif" font-size="12" fill="rgba(255,255,255,0.6)" text-anchor="middle">🏛️</text>
      </g>`,
      // 星星图标
      `<g transform="translate(250, 155)">
        <polygon points="0,-30 10,-10 30,-10 15,5 20,25 0,15 -20,25 -15,5 -30,-10 -10,-10" fill="rgba(255,255,255,0.2)" stroke="${accentColor}" stroke-width="2"/>
        <text x="0" y="-38" font-family="Arial, sans-serif" font-size="12" fill="rgba(255,255,255,0.6)" text-anchor="middle">⭐</text>
      </g>`,
      // 奖杯图标
      `<g transform="translate(250, 150)">
        <rect x="-15" y="-25" width="30" height="35" rx="5" fill="rgba(255,255,255,0.2)" stroke="${accentColor}" stroke-width="2"/>
        <rect x="-20" y="-15" width="40" height="20" rx="8" fill="none" stroke="${accentColor}" stroke-width="2"/>
        <text x="0" y="-32" font-family="Arial, sans-serif" font-size="12" fill="rgba(255,255,255,0.6)" text-anchor="middle">🏆</text>
      </g>`,
      // 钥匙图标
      `<g transform="translate(250, 155)">
        <circle cx="-8" cy="0" r="12" fill="none" stroke="${accentColor}" stroke-width="3"/>
        <line x1="4" y1="0" x2="30" y2="0" stroke="${accentColor}" stroke-width="3" stroke-linecap="round"/>
        <line x1="20" y1="0" x2="20" y2="10" stroke="${accentColor}" stroke-width="2" stroke-linecap="round"/>
        <text x="0" y="-30" font-family="Arial, sans-serif" font-size="12" fill="rgba(255,255,255,0.6)" text-anchor="middle">🔑</text>
      </g>`,
      // 皇冠图标
      `<g transform="translate(250, 150)">
        <polygon points="-30,20 -20,-15 -10,5 0,-20 10,5 20,-15 30,20" fill="rgba(255,255,255,0.15)" stroke="${accentColor}" stroke-width="2"/>
        <rect x="-10" y="-25" width="20" height="10" rx="3" fill="${accentColor}"/>
        <circle cx="0" cy="-25" r="4" fill="#FFD700"/>
        <text x="0" y="-38" font-family="Arial, sans-serif" font-size="12" fill="rgba(255,255,255,0.6)" text-anchor="middle">👑</text>
      </g>`,
    ];

    return icons[iconType] || icons[0];
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash);
  }

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
