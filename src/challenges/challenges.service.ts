import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Challenge, Match } from './interfaces/challenge.interface';
import { Model } from 'mongoose';
import { CreateChallengeDto } from './dtos/create-challenge.dto';
import { PlayersService } from 'src/players/players.service';
import { UpdateChallengeDto } from './dtos/update-challenge.dto';
import { AssignChallengeMatchDto } from './dtos/assign-challenge-match.dto';
import { ChallengeStatus } from './interfaces/challenge-status.enum';
import { CategoriesService } from 'src/categories/categories.service';

@Injectable()
export class ChallengesService {
  constructor(
    @InjectModel('Challenge') private readonly challengeModel: Model<Challenge>,
    @InjectModel('Match') private readonly matchModel: Model<Match>,
    private readonly playersService: PlayersService,
    private readonly categoriesService: CategoriesService,
  ) {}

  private readonly logger = new Logger(ChallengesService.name);

  async createChallenge(
    createChallengeDto: CreateChallengeDto,
  ): Promise<Challenge> {
    const players = await this.playersService.searchAllPlayers();

    createChallengeDto.players.map((playerDto) => {
      const playerFilter = players.filter(
        (player) => player._id == playerDto._id,
      );

      if (playerFilter.length == 0) {
        throw new BadRequestException(
          `The id ${playerDto._id} is not a player.`,
        );
      }
    });

    const requesterPlayerMatch = await createChallengeDto.players.filter(
      (jogador) => jogador._id == createChallengeDto.requester,
    );

    this.logger.log(`requesterPlayerMatch: ${requesterPlayerMatch}`);

    if (requesterPlayerMatch.length == 0) {
      throw new BadRequestException('The requester must be from a player.');
    }

    const playerCategory = await this.categoriesService.searchCategoryPlayer(
      createChallengeDto.requester,
    );

    if (!playerCategory) {
      throw new BadRequestException(
        'The requester must be registered in a category.',
      );
    }

    const challengeCreated = new this.challengeModel(createChallengeDto);

    challengeCreated.category = playerCategory.category;
    challengeCreated.dateHourRequest = new Date();
    challengeCreated.status = ChallengeStatus.PENDING;

    this.logger.log(`challengeCreated: ${JSON.stringify(challengeCreated)}`);

    return await challengeCreated.save();
  }

  async searchAllChallenges(): Promise<Array<Challenge>> {
    return await this.challengeModel
      .find()
      .populate('requester')
      .populate('players')
      .populate('match')
      .exec();
  }

  async searchPlayerChallenges(_id: any): Promise<Array<Challenge>> {
    const players = await this.playersService.searchAllPlayers();

    const filterPlayer = players.filter((player) => player._id == _id);

    if (filterPlayer.length == 0) {
      throw new BadRequestException(`The id ${_id} is not a player.`);
    }

    return await this.challengeModel
      .find()
      .where('players')
      .in(_id)
      .populate('requester')
      .populate('players')
      .populate('match')
      .exec();
  }

  async updateChallenge(
    _id: string,
    updateChallengeDto: UpdateChallengeDto,
  ): Promise<void> {
    const challengeExists = await this.challengeModel.findById(_id).exec();

    if (!challengeExists) {
      throw new NotFoundException(`Challenge ${_id} not registered.`);
    }

    if (updateChallengeDto.status) {
      challengeExists.dateHourResponse = new Date();
    }

    challengeExists.status = updateChallengeDto.status;
    challengeExists.dateHourChallenge = updateChallengeDto.dateHourChallenge;

    await this.challengeModel
      .findOneAndUpdate({ _id }, { $set: challengeExists })
      .exec();
  }

  async assignChallengeMatch(
    _id: string,
    assignChallengeMatchDto: AssignChallengeMatchDto,
  ): Promise<void> {
    const challengeExists = await this.challengeModel.findById(_id).exec();

    if (!challengeExists) {
      throw new BadRequestException(`Challenge ${_id} not registered.`);
    }

    const playerFilter = challengeExists.players.filter(
      (player) => player._id == assignChallengeMatchDto.def,
    );

    this.logger.log(`challengeExists: ${challengeExists}`);
    this.logger.log(`playerFilter: ${playerFilter}`);

    if (playerFilter.length === 0) {
      throw new BadRequestException(
        'The player does not participate in this challenge.',
      );
    }

    const matchCreated = new this.matchModel(assignChallengeMatchDto);

    matchCreated.category = challengeExists.category;
    matchCreated.players = challengeExists.players;

    const result = await matchCreated.save();

    challengeExists.status = ChallengeStatus.ACCOMPLISHED;
    challengeExists.match = result._id;

    try {
      await this.challengeModel
        .findOneAndUpdate({ _id }, { $set: challengeExists })
        .exec();
    } catch (error) {
      await this.matchModel.deleteOne({ _id: result._id }).exec();

      throw new InternalServerErrorException();
    }
  }

  async deleteChallenge(_id: string): Promise<void> {
    const challengeExists = await this.challengeModel.findById(_id).exec();

    if (!challengeExists) {
      throw new BadRequestException(`Challenge ${_id} not registered.`);
    }

    challengeExists.status = ChallengeStatus.CANCELED;

    await this.challengeModel
      .findOneAndUpdate({ _id }, { $set: challengeExists })
      .exec();
  }
}
