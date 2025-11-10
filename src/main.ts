import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { SentryFilter } from './sentry/sentry.filter.js';
import { initializeSentry } from './instrument';
import passport from 'passport';
import * as fs from 'fs';

async function bootstrap() {
  initializeSentry();
  // const isDev = process.env.NODE_ENV !== 'production';
  // const httpsOptions = isDev
  //   ? {
  //       // key: fs.readFileSync('./localhost-key.pem'),
  //       // cert: fs.readFileSync('./localhost.pem'),
  //     }
  //   : undefined;

  // const app = await NestFactory.create(AppModule, {
  //   httpsOptions,
  // });
  const app = await NestFactory.create(AppModule);

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new SentryFilter(httpAdapter));

  // Stripe webhook needs raw body
  app.use('/webhook', express.raw({ type: 'application/json' }));

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.use(cookieParser());

  // TODO convert to ENV

  app.enableCors({
    origin: process.env.FRONT_END_URL, // your frontend URL
    credentials: true,
  });

  app.use(passport.initialize());

  const config = new DocumentBuilder()
    .setTitle('Career Fingerprint API')
    .setDescription('API for the Career Fingerprint Application')
    .setVersion('1.0')
    .addCookieAuth()
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
