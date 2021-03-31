import { ChallengeStatus } from '../interfaces/challenge-status.enum';
import { IsOptional } from 'class-validator';

export class UpdateChallengeDto {
  @IsOptional()
  dateHourChallenge: Date;

  @IsOptional()
  status: ChallengeStatus;
}
