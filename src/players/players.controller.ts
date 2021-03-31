import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreatePlayerDto } from './dtos/create-player.dto';
import { UpdatePlayerDto } from './dtos/update-player.dto';
import { PlayersService } from './players.service';
import { Player } from './interfaces/player.interface';
import { ValidationParametersPipe } from '../common/pipes/validation-parameters.pipe';

@Controller('api/v1/players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Post()
  @UsePipes(ValidationPipe)
  async createPlayer(
    @Body() createPlayerDto: CreatePlayerDto,
  ): Promise<Player> {
    return await this.playersService.createPlayer(createPlayerDto);
  }

  @Put('/:_id')
  @UsePipes(ValidationPipe)
  async updatePlayer(
    @Body() updatePlayerDto: UpdatePlayerDto,
    @Param('_id', ValidationParametersPipe) _id: string,
  ): Promise<void> {
    await this.playersService.updatePlayer(_id, updatePlayerDto);
  }

  @Get()
  async searchPlayers(): Promise<Player[]> {
    return await this.playersService.searchAllPlayers();
  }

  @Get('/:_id')
  async searchPlayersToId(
    @Param('_id', ValidationParametersPipe) _id: string,
  ): Promise<Player> {
    return await this.playersService.searchPlayerToId(_id);
  }

  @Delete('/:_id')
  async deletePlayer(
    @Param('_id', ValidationParametersPipe) _id: string,
  ): Promise<void> {
    this.playersService.deletePlayer(_id);
  }
}
