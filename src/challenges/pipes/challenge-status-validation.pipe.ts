import { PipeTransform, BadRequestException } from '@nestjs/common';
import { ChallengeStatus } from '../interfaces/challenge-status.enum';

export class ChallengeStatusValidationPipe implements PipeTransform {
  readonly statusPrimitives = [
    ChallengeStatus.ACCEPT,
    ChallengeStatus.DENIED,
    ChallengeStatus.CANCELED,
  ];

  transform(value: any) {
    const status = value.status.toUpperCase();

    if (!this.validStatus(status)) {
      throw new BadRequestException(`${status} is valid status.`);
    }

    return value;
  }

  private validStatus(status: any) {
    const idx = this.statusPrimitives.indexOf(status);

    return idx !== -1;
  }
}
