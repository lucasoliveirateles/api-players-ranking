import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';

export class ValidationParametersPipe implements PipeTransform {
  transform(value: any, metaData: ArgumentMetadata) {
    if (!value) {
      throw new BadRequestException(
        `The value of parameter ${metaData.data} must be informed.`,
      );
    }

    return value;
  }
}
