import { episode1Tips } from './episode-1'
import type { StoryTipsData } from './types'

export type { StoryTipsData } from './types'

const allEpisodes: Record<number, StoryTipsData[]> = {
  1: episode1Tips,
  // Episode 2 以降はここに追加：2: episode2Tips,
}

export function getStoryTips(
  episode: number,
  chapter: number
): StoryTipsData | null {
  const epData = allEpisodes[episode]
  if (!epData) return null
  return epData.find((d) => d.chapter === chapter) ?? null
}
