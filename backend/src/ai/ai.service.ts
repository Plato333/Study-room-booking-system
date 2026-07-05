import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Reservation, ReservationStatus } from '../reservations/entities/reservation.entity';
import { Seat, SeatStatus } from '../seats/entities/seat.entity';
import { StudyRoom } from '../study-rooms/entities/study-room.entity';

@Injectable()
export class AiService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Reservation) private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Seat) private readonly seatRepository: Repository<Seat>,
    @InjectRepository(StudyRoom) private readonly studyRoomRepository: Repository<StudyRoom>,
  ) {}

  async chat(message: string) {
    // 收集实时上下文
    const context = await this.buildContext();
    const reply = await this.callDeepSeek(message, context);
    return { reply };
  }

  private async buildContext(): Promise<string> {
    const today = new Date().toISOString().slice(0, 10);
    const totalSeats = await this.seatRepository.count();
    const availSeats = await this.seatRepository.count({ where: { status: SeatStatus.AVAILABLE } as any });
    const todayReservations = await this.reservationRepository.count({
      where: { date: today, status: Not(ReservationStatus.CANCELLED) } as any,
    });
    const rooms = await this.studyRoomRepository.find({ where: { status: 'open' } as any });

    return `当前日期：${today}
自习室数量：${rooms.length}
总座位数：${totalSeats}
空闲座位数：${availSeats}
今日预约次数：${todayReservations}
开放自习室：${rooms.map(r => `${r.name}(${r.location} ${r.open_time.slice(0,5)}-${r.close_time.slice(0,5)})`).join('、')}`;
  }

  private async callDeepSeek(message: string, context: string): Promise<string> {
    const apiKey = this.configService.get<string>('AI_API_KEY');
    const baseUrl = this.configService.get<string>('AI_BASE_URL', 'https://api.deepseek.com');
    const model = this.configService.get<string>('AI_MODEL', 'deepseek-chat');

    if (!apiKey || apiKey.startsWith('sk-你的')) {
      return `⚠️ 还没配置 DeepSeek API Key。

请在 \`.env\` 文件中填写你的 Key：
\`\`\`
AI_API_KEY=sk-你的DeepSeekKey
\`\`\`

配置完成后重启后端即可。

（当前使用本地问答模式）
${await this.fallbackReply(message)}`;
    }

    try {
      const res = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: `你是自习室预约系统的 AI 助手。你擅长回答关于座位预约、自习室信息的问题。

回答规则：
1. 用中文回复，简洁友好，可以使用 emoji
2. 根据提供的实时数据回答问题
3. 如果用户问"怎么预约"，引导他们去"预约座位"页面
4. 如果用户问的问题与自习室无关，礼貌地告知你只回答自习室相关问题
5. 不知道的不要瞎编

当前系统状态：
${context}`,
            },
            { role: 'user', content: message },
          ],
          temperature: 0.7,
          max_tokens: 800,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        return `😅 API 请求失败（${res.status}）：${err}`;
      }

      const data = await res.json() as any;
      return data.choices?.[0]?.message?.content || '😅 没有获取到回复';
    } catch (e: any) {
      return `😅 网络请求失败：${e.message}。请检查 API Key 和网络连接。`;
    }
  }

  private async fallbackReply(msg: string): Promise<string> {
    const m = msg.toLowerCase();
    if (m.includes('空闲') || m.includes('空位')) return '暂时无法查询，请先配置 API Key 后重试。';
    if (m.includes('自习室')) return '暂时无法查询，请先配置 API Key。';
    return '请先配置 API Key 后使用 AI 助手。';
  }
}
