import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Root');
  const app = await NestFactory.create(AppModule);
  await app.listen(8008, () => {
    logger.log(`Server started on port: ${ process.env.PORT }`);
  });
}
bootstrap();
