import axios from 'axios';
import { Passage, BiblePassageResponse, BibleTranslation } from '../types/bible.types';
import * as bibleRepository from '../db/bibleRepository';

const bibleApiClient = axios.create({
  baseURL: 'https://bible-api.com',
  timeout: 10000,
});

export async function fetchPassage(
  passage: Passage,
  translation: BibleTranslation = 'kjv'
): Promise<BiblePassageResponse | null> {
  // Check cache first
  const cached = await bibleRepository.getCachedPassage(passage.id, translation);
  if (cached) {
    try {
      return JSON.parse(cached.verseText);
    } catch {
      // Cache corrupted, re-fetch
    }
  }

  try {
    const response = await bibleApiClient.get(`/${passage.apiQuery}`, {
      params: { translation },
    });
    const data: BiblePassageResponse = response.data;

    // Cache the result
    await bibleRepository.cachePassage({
      passageId: passage.id,
      translation,
      verseText: JSON.stringify(data),
      fetchedAt: new Date().toISOString(),
    });

    return data;
  } catch (error: any) {
    console.warn('[BibleAPI] Failed to fetch passage:', passage.displayText, error.message);
    return null;
  }
}

export async function fetchPassageText(
  passage: Passage,
  translation: BibleTranslation = 'kjv'
): Promise<string> {
  const result = await fetchPassage(passage, translation);
  if (!result) return `Could not load ${passage.displayText}. Check your connection and try again.`;
  return result.text;
}
