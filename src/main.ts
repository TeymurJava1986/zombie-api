import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { config } from 'dotenv';
import { displayEnv } from 'dotenv-display';
import * as path from 'path';

async function bootstrap() {
  const logger = new Logger('Root');
  loadConfig();
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT || 8008, () => {
    logger.log(`Server started on port: ${ process.env.PORT }`);
  });
}

const loadConfig = (): void => {
  const configPath = path.join(__dirname, '../.env');
  const env = config({ path: configPath });
  displayEnv(env.parsed);
};

bootstrap();
