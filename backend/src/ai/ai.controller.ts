import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AiService } from './ai.service';
import { AiChatDto } from './dto/ai-chat.dto';

@Controller('api/ai')
@UseGuards(AuthGuard('jwt'))
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(@Body() dto: AiChatDto) {
    return this.aiService.chat(dto.message);
  }
}
