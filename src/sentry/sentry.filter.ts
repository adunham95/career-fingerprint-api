import { Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { SentryExceptionCaptured } from '@sentry/nestjs';

@Catch()
export class SentryFilter extends BaseExceptionFilter {
  @SentryExceptionCaptured()
  catch(exception: HttpException, host: ArgumentsHost) {
    super.catch(exception, host);
  }
}
