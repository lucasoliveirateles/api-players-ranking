import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreatePlayerDto } from './dtos/create-player.dto';
import { UpdatePlayerDto } from './dtos/update-player.dto';
import { Player } from './interfaces/player.interface';
import { v4 as uuid } from 'uuid';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PlayersService {
  constructor(
    @InjectModel('Player') private readonly playerModel: Model<Player>,
  ) {}

  private readonly logger = new Logger(PlayersService.name);

  async createPlayer(createPlayerDto: CreatePlayerDto): Promise<Player> {
    const { email } = createPlayerDto;

    const playerExists = await this.playerModel.findOne({ email }).exec();

    if (playerExists) {
      throw new BadRequestException(`This player ${email} already exists.`);
    }

    const playerCreated = new this.playerModel(createPlayerDto);

    return await playerCreated.save();
  }

  async updatePlayer(
    _id: string,
    updatePlayerDto: UpdatePlayerDto,
  ): Promise<void> {
    const playerExists = await this.playerModel.findOne({ _id }).exec();

    if (!playerExists) {
      throw new NotFoundException(`Player ${_id} not found. `);
    }

    await this.playerModel
      .findOneAndUpdate({ _id }, { $set: updatePlayerDto })
      .exec();
  }

  async searchAllPlayers(): Promise<Player[]> {
    return await this.playerModel.find().exec();
  }

  async searchPlayerToId(_id: string): Promise<Player> {
    const playerExists = await this.playerModel.findOne({ _id }).exec();

    if (!playerExists) {
      throw new NotFoundException(`Player with id ${_id} not found.`);
    }

    return playerExists;
  }

  async deletePlayer(_id: string): Promise<any> {
    const playerExists = this.playerModel.findOne({ _id }).exec();

    if (!playerExists) {
      throw new NotFoundException(`Player with id ${_id} not found.`);
    }

    return await this.playerModel.deleteOne({ _id }).exec();
  }
}
