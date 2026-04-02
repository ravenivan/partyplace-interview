import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VenuesModule } from './venues/venues.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    VenuesModule,
  ],
})
export class AppModule {}