export type Tip = {
  action: string
  note?: string
  priority?: number
  from_chapter?: number
}

export type Item = {
  name: string
  linkedTipIndex: number
  priceFrom: number
  url: string | null
}

export type ArticleLink = {
  title: string
  url: string
  body: string
}

export type StoryTipsData = {
  episode: number
  chapter: number
  is_episode_summary?: boolean
  insights: string[]
  tips: Tip[]
  items: Item[]
  article_link?: ArticleLink
}
