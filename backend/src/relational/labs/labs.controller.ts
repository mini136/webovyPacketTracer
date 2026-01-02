import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LabsService } from './labs.service';
import { JwtAuthGuard } from '../../services/auth.guard';
import { CreateLabDto, UpdateLabDto } from './labs.dto';

@Controller('labs')
@UseGuards(JwtAuthGuard)
export class LabsController {
  constructor(private readonly labsService: LabsService) {}

  @Get()
  list(@Req() req: any) {
    const userId = (req.user?._id as any)?.toString?.() ?? req.user?.id;
    return this.labsService.listLabs(String(userId));
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateLabDto) {
    const userId = (req.user?._id as any)?.toString?.() ?? req.user?.id;
    return this.labsService.createLabAndTopology({
      ownerMongoUserId: String(userId),
      name: dto.name,
      description: dto.description,
      isPublic: dto.isPublic ?? false,
      allowedModels: dto.allowedModels ?? [],
    });
  }

  @Put(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateLabDto) {
    const userId = (req.user?._id as any)?.toString?.() ?? req.user?.id;
    return this.labsService.updateLab({
      labId: id,
      ownerMongoUserId: String(userId),
      name: dto.name,
      description: dto.description,
      isPublic: dto.isPublic,
      allowedModels: dto.allowedModels,
    });
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    const userId = (req.user?._id as any)?.toString?.() ?? req.user?.id;
    await this.labsService.deleteLab(id, String(userId));
    return { message: 'Lab deleted' };
  }

  @Post(':id/attach-topology')
  attachTopology(@Req() req: any, @Param('id') id: string) {
    const userId = (req.user?._id as any)?.toString?.() ?? req.user?.id;
    return this.labsService.attachTopology(id, String(userId));
  }
}
