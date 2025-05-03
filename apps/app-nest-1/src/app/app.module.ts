import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import path from 'path';
import type { Response } from 'express';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      // No need to import in other modules
      isGlobal: true,
      expandVariables: true,
      // cache: true,
    }),
    // https://docs.nestjs.com/recipes/serve-static
    // https://github.com/nestjs/serve-static
    // https://github.com/nestjs/serve-static/blob/master/lib/interfaces/serve-static-options.interface.ts
    ServeStaticModule.forRoot({
      rootPath: path.join(
        process.cwd(),
        'dist',
        'apps',
        'app-angular-2',
        'browser',
      ),
      serveRoot: '/app-angular-2',
      serveStaticOptions: {
        setHeaders: (res: Response, url) => {
          res.set({ 'X-Custom-Header': 'app-angular-2' });
        },
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
