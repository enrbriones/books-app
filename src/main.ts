import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config';
import { ValidationPipe } from '@nestjs/common';
import { TimeoutInterceptor } from './interceptors/timeout.interceptors';
import { AuditInterceptor } from './interceptors/audit.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  app.useGlobalInterceptors(new TimeoutInterceptor());
  app.useGlobalInterceptors(new AuditInterceptor());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('CMPC Libros API')
    .setDescription(
      'API completa para la gestión de libros, autores, editoriales y géneros',
    )
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Ingresa tu token JWT',
      in: 'header',
    })
    .addTag('auth', 'Endpoints de autenticación')
    .addTag('books', 'Endpoints de libros')
    .addTag('authors', 'Endpoints de autores')
    .addTag('editorials', 'Endpoints de editoriales')
    .addTag('genres', 'Endpoints de géneros')
    .addTag('app', 'Endpoints generales')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(envs.port, '0.0.0.0');
  console.log(`App running on port ${envs.port}`);
}
void bootstrap();
