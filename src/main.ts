import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Stripe webhook needs raw body
  app.use('/webhook', express.raw({ type: 'application/json' }));

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.use(cookieParser());

  // TODO convert to ENV

  app.enableCors({
    origin: process.env.FRONT_END_URL, // your frontend URL
    credentials: true,
  });

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
