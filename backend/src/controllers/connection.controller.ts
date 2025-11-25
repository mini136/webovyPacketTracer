import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ConnectionService } from '../services/connection.service';
import { CreateConnectionDto } from '../dto/connection.dto';

@Controller('connections')
export class ConnectionController {
  constructor(private readonly connectionService: ConnectionService) {}

  @Post()
  create(@Body() createConnectionDto: CreateConnectionDto) {
    return this.connectionService.create(createConnectionDto);
  }

  @Get()
  findByTopology(@Query('topologyId') topologyId: string) {
    return this.connectionService.findByTopology(topologyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.connectionService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.connectionService.remove(id);
  }
}
