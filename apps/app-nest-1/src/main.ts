/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { createProxyMiddleware } from 'http-proxy-middleware';

import { AppModule } from './app/app.module';

async function bootstrap() {
  await ConfigModule.envVariablesLoaded;
  // console.log(process.env['GREETING']);

  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  app.use(
    '/app-angular-1',
    createProxyMiddleware({
      target: 'http://localhost:4000',
      changeOrigin: true,
      pathRewrite: {
        /* Angular router handles routing */
        '.*': '/index.html',
      },
    }),
  );

  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const port = Number(process.env['PORT']) || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port.toString()}/${globalPrefix}`,
  );
}

void bootstrap();
