import { IsNotEmpty } from 'class-validator';
import { Result } from '../interfaces/challenge.interface';
import { Player } from '../../players/interfaces/player.interface';

export class AssignChallengeMatchDto {
  @IsNotEmpty()
  def: Player;

  @IsNotEmpty()
  result: Array<Result>;
}
