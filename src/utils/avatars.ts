import { publicAsset } from './publicAsset'

/**
 * DiceBear Lorelei（MIT）— 柔和插畫人像，溫暖清新、適合家庭保障情境
 * https://www.dicebear.com/styles/lorelei/
 */
const DICEBEAR_STYLE = 'lorelei'
const DICEBEAR_BASE = `https://api.dicebear.com/9.x/${DICEBEAR_STYLE}/svg`

/** 呼應護家神山品牌色的暖色背景 */
const WARM_BACKGROUNDS = [
  'd4efec',
  'f9efe4',
  'ffedd5',
  'e8f5f3',
  'fef3c7',
  'fce7f3',
  'c0ebdf',
]

function buildDiceBearUrl(seed: string, backgroundColor: string): string {
  const params = new URLSearchParams({
    seed,
    backgroundColor,
    radius: '50',
    scale: '88',
  })
  return `${DICEBEAR_BASE}?${params.toString()}`
}

export function getMemberAvatarUrl(seed: string, index = 0): string {
  const bg = WARM_BACKGROUNDS[index % WARM_BACKGROUNDS.length]
  return buildDiceBearUrl(seed, bg)
}

/** 護家神山品牌圖示 */
export function getFamilyMascotUrl(): string {
  return publicAsset('/app-icon.png')
}

export function getAdvisorAvatarUrl(advisorSeed = 'advisor-linjiajung'): string {
  return buildDiceBearUrl(advisorSeed, 'd4efec')
}