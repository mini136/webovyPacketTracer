import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { TopologyService } from '../services/topology.service';
import { CreateTopologyDto, UpdateTopologyDto } from '../dto/topology.dto';

@Controller('topologies')
export class TopologyController {
  constructor(private readonly topologyService: TopologyService) {}

  @Post()
  create(@Body() createTopologyDto: CreateTopologyDto) {
    return this.topologyService.create(createTopologyDto);
  }

  @Get()
  findAll(@Query('userId') userId: string) {
    return this.topologyService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.topologyService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateTopologyDto: UpdateTopologyDto) {
    return this.topologyService.update(id, updateTopologyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.topologyService.remove(id);
  }
}
