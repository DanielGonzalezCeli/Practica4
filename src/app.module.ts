import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { HttpModule } from '@nestjs/axios';
import { join } from 'path';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ProductosResolver } from './productos/productos.resolver.js';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'schema.gql'),
    }),
    HttpModule.register({}),
  ],
  controllers: [AppController],
  providers: [AppService, ProductosResolver],
})
export class AppModule {}