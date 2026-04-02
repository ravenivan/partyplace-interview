import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import venues from './venues.json';

export interface ParsedQuery {
  budget?: number;
  guestCount?: number;
  location?: string;
  date?: string;
  time?: string;
  occasion?: string;
}

@Injectable()
export class VenuesService {

  private client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  async search(query: string) {
    // Step 1 - Parse natural language with OpenAI
    const parsed = await this.parseQuery(query);

    // Step 2 - Validate the request
    const validation = this.validate(parsed);
    if (!validation.valid) {
      return {
        valid: false,
        error: validation.error,
        suggestion: validation.suggestion,
      };
    }

    // Step 3 - Match venues
    const results = this.matchVenues(parsed);

    return {
      valid: true,
      filters: parsed,
      results,
    };
  }

  private async parseQuery(query: string): Promise<ParsedQuery> {
    const response = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a venue search assistant. Extract structured filters from the user's natural language query.
Return ONLY a JSON object with these fields (omit fields not mentioned):
- budget (number)
- guestCount (number)
- location (string, neighborhood name only)
- date (string, full date like YYYY-MM-DD or day name like "Friday")
- time (string, one of: morning, afternoon, evening, night)
- occasion (string, one of: Birthday, Wedding, Engagement, Graduation, Anniversary, Reunion, Fundraiser, Office Party, Holiday Party, Happy hour, Bachelor/Bachelorette)`
        },
        {
          role: 'user',
          content: query,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('No response from OpenAI');

    return JSON.parse(content);
  }

  private validate(parsed: ParsedQuery): {
    valid: boolean;
    error?: string;
    suggestion?: string;
  } {
    // Rule 1 - Guest count required
    if (!parsed.guestCount) {
      return {
        valid: false,
        error: 'Guest count is required to find a suitable venue.',
        suggestion: 'Try adding how many guests you expect, e.g. "for 50 people".',
      };
    }

    // Rule 2 - Weekend bookings require minimum $500 budget
    if (parsed.date) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const isAlreadyDayName = dayNames.includes(parsed.date);
      const dayIndex = isAlreadyDayName
        ? dayNames.indexOf(parsed.date)
        : new Date(parsed.date).getDay();
      const isWeekend = dayIndex === 0 || dayIndex === 6;
      if (isWeekend && (!parsed.budget || parsed.budget < 500)) {
        return {
          valid: false,
          error: 'Weekend bookings require a minimum budget of $500.',
          suggestion: 'Try specifying a budget of at least $500 for weekend events.',
        };
      }
    }

    // Rule 3 - Guest count must be reasonable (500 guests max)
    if (parsed.guestCount > 500) {
      return {
        valid: false,
        error: 'We currently do not support events with more than 500 guests.',
        suggestion: 'Try searching for a smaller guest count or contact us directly.',
      };
    }

    return { valid: true };
  }

  private matchVenues(parsed: ParsedQuery) {
    return venues.filter(venue => {
      // Guest count
      if (parsed.guestCount && venue.maxGuestCount && venue.maxGuestCount < parsed.guestCount) return false;

      // Budget
      if (parsed.budget && venue.minBudget && venue.minBudget > parsed.budget) return false;

      // Location
      if (parsed.location && !venue.location.toLowerCase().includes(parsed.location.toLowerCase())) return false;

      // Occasion — case insensitive match
      if (parsed.occasion && !venue.occasions.some(o => o.toLowerCase() === parsed.occasion?.toLowerCase())) return false;

      // Day of week from date
      if (parsed.date) {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const isAlreadyDayName = dayNames.includes(parsed.date);
        const day = isAlreadyDayName
          ? parsed.date
          : new Date(parsed.date).toLocaleDateString('en-US', { weekday: 'long' });
        if (!venue.availableDays.includes(day)) return false;
      }

      // Time
      if (parsed.time && !venue.openTimes.includes(parsed.time.toLowerCase())) return false;

      return true;
    });
  }
}