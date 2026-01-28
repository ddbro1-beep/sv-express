import * as cheerio from 'cheerio';

export interface TrackingEvent {
  date: string;
  time: string;
  location: string;
  status: string;
}

export interface TrackingResult {
  trackingNumber: string;
  carrier: string | null;
  currentStatus: string | null;
  lastUpdate: string | null;
  origin: string | null;
  destination: string | null;
  events: TrackingEvent[];
  found: boolean;
}

// Simple in-memory cache (10 minutes TTL)
const cache = new Map<string, { data: TrackingResult; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export function getCachedResult(trackingNumber: string): TrackingResult | null {
  const cached = cache.get(trackingNumber.toUpperCase());
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

export function setCachedResult(trackingNumber: string, data: TrackingResult): void {
  cache.set(trackingNumber.toUpperCase(), { data, timestamp: Date.now() });
}

export function parseTrackingHtml(html: string, trackingNumber: string): TrackingResult {
  const $ = cheerio.load(html);

  const result: TrackingResult = {
    trackingNumber,
    carrier: null,
    currentStatus: null,
    lastUpdate: null,
    origin: null,
    destination: null,
    events: [],
    found: false,
  };

  try {
    // Try multiple selectors for carrier name
    const carrierSelectors = [
      '.carrier-name',
      '.tracking-carrier',
      '.courier-name',
      '[data-carrier]',
      '.provider-name',
      'h2.carrier',
      '.shipment-carrier',
    ];

    for (const selector of carrierSelectors) {
      const carrierEl = $(selector).first();
      if (carrierEl.length && carrierEl.text().trim()) {
        result.carrier = carrierEl.text().trim();
        break;
      }
    }

    // Try multiple selectors for current status
    const statusSelectors = [
      '.current-status',
      '.tracking-status',
      '.status-text',
      '.shipment-status',
      '.last-status',
      '[data-status]',
      '.status-badge',
    ];

    for (const selector of statusSelectors) {
      const statusEl = $(selector).first();
      if (statusEl.length && statusEl.text().trim()) {
        result.currentStatus = statusEl.text().trim();
        result.found = true;
        break;
      }
    }

    // Try multiple selectors for last update time
    const updateSelectors = [
      '.last-update',
      '.update-time',
      '.tracking-date',
      '.last-event-date',
      'time',
    ];

    for (const selector of updateSelectors) {
      const updateEl = $(selector).first();
      if (updateEl.length && updateEl.text().trim()) {
        result.lastUpdate = updateEl.text().trim();
        break;
      }
    }

    // Try to find tracking events table/list
    const eventSelectors = [
      '.tracking-event',
      '.event-row',
      '.tracking-history tr',
      '.events-list li',
      '.checkpoint',
      '.tracking-step',
      'table.tracking tbody tr',
    ];

    for (const selector of eventSelectors) {
      const events = $(selector);
      if (events.length > 0) {
        events.each((_, el) => {
          const $el = $(el);
          const event: TrackingEvent = {
            date: $el.find('.date, .event-date, td:first-child').text().trim() || '',
            time: $el.find('.time, .event-time, td:nth-child(2)').text().trim() || '',
            location: $el.find('.location, .event-location, td:nth-child(3)').text().trim() || '',
            status: $el.find('.status, .event-status, .description, td:last-child').text().trim() || $el.text().trim(),
          };

          if (event.status) {
            result.events.push(event);
            result.found = true;
          }
        });

        if (result.events.length > 0) break;
      }
    }

    // If we found events but no current status, use the first event
    if (!result.currentStatus && result.events.length > 0) {
      result.currentStatus = result.events[0].status;
      result.lastUpdate = result.events[0].date + ' ' + result.events[0].time;
    }

    // Check for "not found" messages
    const notFoundSelectors = [
      '.not-found',
      '.no-results',
      '.error-message',
      '.tracking-not-found',
    ];

    for (const selector of notFoundSelectors) {
      if ($(selector).length > 0) {
        result.found = false;
        result.currentStatus = 'Посылка не найдена';
        break;
      }
    }

  } catch (error) {
    console.error('Error parsing tracking HTML:', error);
  }

  return result;
}

export async function fetchTrackingInfo(trackingNumber: string, lang: string = 'ru'): Promise<TrackingResult & { requiresRedirect?: boolean }> {
  // Check cache first
  const cached = getCachedResult(trackingNumber);
  if (cached) {
    return cached;
  }

  const url = `https://track.global/${lang}?tracking=${encodeURIComponent(trackingNumber)}`;

  try {
    // Use AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': lang === 'ru' ? 'ru-RU,ru;q=0.9,en;q=0.8' : 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();

    // If we got very little HTML, the site might be JS-rendered
    if (html.length < 1000) {
      return {
        trackingNumber,
        carrier: null,
        currentStatus: lang === 'ru' ? 'Откройте track.global для просмотра' : 'Open track.global to view',
        lastUpdate: null,
        origin: null,
        destination: null,
        events: [],
        found: false,
        requiresRedirect: true,
      };
    }

    const result = parseTrackingHtml(html, trackingNumber);

    // Cache the result only if we found something
    if (result.found) {
      setCachedResult(trackingNumber, result);
    }

    return result;
  } catch (error) {
    console.error('Error fetching tracking info:', error);

    // Return redirect flag so frontend knows to offer direct link
    return {
      trackingNumber,
      carrier: null,
      currentStatus: lang === 'ru' ? 'Сервис временно недоступен' : 'Service temporarily unavailable',
      lastUpdate: null,
      origin: null,
      destination: null,
      events: [],
      found: false,
      requiresRedirect: true,
    };
  }
}
