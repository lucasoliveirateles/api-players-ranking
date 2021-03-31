import {
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  Body,
  Get,
  Query,
  Put,
  Param,
  Delete,
  Logger,
} from '@nestjs/common';
import { ChallengesService } from './challenges.service';
import { CreateChallengeDto } from './dtos/create-challenge.dto';
import { Challenge } from './interfaces/challenge.interface';
import { ChallengeStatusValidationPipe } from './pipes/challenge-status-validation.pipe';
import { AssignChallengeMatchDto } from './dtos/assign-challenge-match.dto';
import { UpdateChallengeDto } from './dtos/update-challenge.dto';

@Controller('api/v1/challenges')
export class ChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

  private readonly logger = new Logger(ChallengesController.name);

  @Post()
  @UsePipes(ValidationPipe)
  async criarDesafio(
    @Body() createChallengeDto: CreateChallengeDto,
  ): Promise<Challenge> {
    this.logger.log(
      `createChallengeDto: ${JSON.stringify(createChallengeDto)}`,
    );

    return await this.challengesService.createChallenge(createChallengeDto);
  }

  @Get()
  async consultarDesafios(
    @Query('idPlayer') _id: string,
  ): Promise<Array<Challenge>> {
    return _id
      ? await this.challengesService.searchPlayerChallenges(_id)
      : await this.challengesService.searchAllChallenges();
  }

  @Put('/:challenge')
  async atualizarDesafio(
    @Body(ChallengeStatusValidationPipe) updateChallengeDto: UpdateChallengeDto,
    @Param('challenge') _id: string,
  ): Promise<void> {
    await this.challengesService.updateChallenge(_id, updateChallengeDto);
  }

  @Post('/:challenge/match')
  async atribuirDesafioPartida(
    @Body(ValidationPipe) assignChallengeMatchDto: AssignChallengeMatchDto,
    @Param('challenge') _id: string,
  ): Promise<void> {
    return await this.challengesService.assignChallengeMatch(
      _id,
      assignChallengeMatchDto,
    );
  }

  @Delete('/:_id')
  async deletarDesafio(@Param('_id') _id: string): Promise<void> {
    this.challengesService.deleteChallenge(_id);
  }
}
