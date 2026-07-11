import { publicAsset } from './publicAsset'

/**
 * DiceBear Micah（MIT）— 手繪插畫人像，膚色與色調偏東亞暖色、淡雅彩色
 * https://www.dicebear.com/styles/micah/
 */
const DICEBEAR_STYLE = 'micah'
const DICEBEAR_BASE = `https://api.dicebear.com/9.x/${DICEBEAR_STYLE}/svg`

/** 溫潤淡雅背景（低飽和、呼應品牌青綠與暖沙色） */
const PASTEL_BACKGROUNDS = [
  'f2ece6',
  'e8f2f0',
  'f5efe8',
  'ebe8f2',
  'e9ede6',
  'f0e9e4',
  'e4efe8',
]

/** 暖色膚色調（亞洲常見暖黃／米色調） */
const WARM_SKIN_TONES = [
  'f5e6d8',
  'edd5c0',
  'e8cfae',
  'dfc9a8',
  'd4b896',
]

function hashSeed(seed: string): number {
  return [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0)
}

function buildDiceBearUrl(seed: string, backgroundColor: string, baseColor: string): string {
  const params = new URLSearchParams({
    seed,
    backgroundColor,
    baseColor,
    radius: '50',
    scale: '86',
  })
  return `${DICEBEAR_BASE}?${params.toString()}`
}

export function getMemberAvatarUrl(seed: string, index = 0): string {
  const hash = hashSeed(seed)
  const bg = PASTEL_BACKGROUNDS[(hash + index) % PASTEL_BACKGROUNDS.length]
  const skin = WARM_SKIN_TONES[hash % WARM_SKIN_TONES.length]
  return buildDiceBearUrl(seed, bg, skin)
}

/** 護家神山品牌圖示 */
export function getFamilyMascotUrl(): string {
  return publicAsset('/app-icon.png')
}

/** AI 顧問頭像 — Lucide Bot 輪廓延伸（ISC），見 public/advisor-bot.svg */
export function getAiAdvisorAvatarUrl(): string {
  return publicAsset('/advisor-bot.svg')
}

/** 人壽業務顧問頭像 */
export function getAgentAvatarUrl(agentName: string): string {
  return getMemberAvatarUrl(agentName)
}