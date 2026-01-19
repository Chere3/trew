import emojis from 'emojibase-data/en/data.json'
import type { Emoji } from 'emojibase'

export interface EmojiItem {
  emoji: string
  label: string
  keywords: string[]
  group: string
  subgroup: string
  version?: string
  order?: number
}

// Map emojibase groups to our category names
const GROUP_MAP: Record<string, string> = {
  'smileys-emotion': 'Smileys & People',
  'people-body': 'Smileys & People',
  'animals-nature': 'Animals & Nature',
  'food-drink': 'Food & Drink',
  'travel-places': 'Travel & Places',
  'activities': 'Activities',
  'objects': 'Objects',
  'symbols': 'Symbols',
  'flags': 'Flags',
}

// Category order for display
export const CATEGORIES = [
  'Smileys & People',
  'Animals & Nature',
  'Food & Drink',
  'Travel & Places',
  'Activities',
  'Objects',
  'Symbols',
  'Flags',
] as const

export type Category = typeof CATEGORIES[number]

// Process emojibase data into our format
function processEmojiData(): EmojiItem[] {
  // Map numeric group to category name
  // Emojibase group indices: 0=smileys-emotion, 1=people-body, 2=component, 3=animals-nature, 
  // 4=food-drink, 5=travel-places, 6=activities, 7=objects, 8=symbols, 9=flags
  const groupNames = [
    'smileys-emotion',  // 0
    'people-body',      // 1
    'component',        // 2 (skip - these are skin tone modifiers, etc.)
    'animals-nature',   // 3
    'food-drink',       // 4
    'travel-places',    // 5
    'activities',       // 6
    'objects',          // 7
    'symbols',          // 8
    'flags',            // 9
  ]
  
  const result: EmojiItem[] = []
  
  for (const emoji of emojis as Emoji[]) {
    // Filter out emojis without required fields
    if (!emoji.emoji || !emoji.label) continue
    
    let groupName = 'Objects'
    let isComponent = false
    
    if (typeof emoji.group === 'number' && emoji.group >= 0 && emoji.group < groupNames.length) {
      const groupKey = groupNames[emoji.group]
      // Skip 'component' group (index 2) - these are modifiers, not displayable emojis
      if (groupKey === 'component') {
        isComponent = true
      } else if (groupKey) {
        groupName = GROUP_MAP[groupKey] || 'Objects'
      }
    } else if (typeof emoji.group === 'string') {
      groupName = GROUP_MAP[emoji.group] || emoji.group
    }
    
    // Skip component emojis (skin tones, etc.)
    if (isComponent) continue
    
    const label = emoji.label || ''
    const keywords = [
      label.toLowerCase(),
      ...(emoji.tags || []).map((tag) => tag.toLowerCase()),
    ].filter(Boolean)

    result.push({
      emoji: emoji.emoji || '',
      label,
      keywords,
      group: groupName,
      subgroup: typeof emoji.subgroup === 'number' ? String(emoji.subgroup) : (emoji.subgroup || ''),
      version: emoji.version ? String(emoji.version) : undefined,
      order: emoji.order,
    })
  }
  
  return result
}

// Cache processed data
let emojiDataCache: EmojiItem[] | null = null

export function getEmojiData(): EmojiItem[] {
  if (!emojiDataCache) {
    emojiDataCache = processEmojiData()
  }
  return emojiDataCache
}

export function getEmojisByCategory(category: Category): EmojiItem[] {
  return getEmojiData().filter((emoji) => emoji.group === category)
}

export function searchEmojis(query: string): EmojiItem[] {
  const lowerQuery = query.toLowerCase().trim()
  if (!lowerQuery) return []

  return getEmojiData().filter((emoji) =>
    emoji.keywords.some((keyword) => keyword.includes(lowerQuery))
  )
}

export function getEmojiByUnicode(unicode: string): EmojiItem | undefined {
  return getEmojiData().find((emoji) => emoji.emoji === unicode)
}
