import { Controller, Post, Body } from '@nestjs/common';
import { VenuesService } from './venues.service';

@Controller('venues')
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  @Post('search')
  async search(@Body() body: { query: string }) {
    return this.venuesService.search(body.query);
  }
}