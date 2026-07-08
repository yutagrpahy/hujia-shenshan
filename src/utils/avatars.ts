/** DiceBear 開源頭像（MIT）— https://www.dicebear.com */
const DICEBEAR_BASE = 'https://api.dicebear.com/9.x/adventurer/svg'

const WARM_BACKGROUNDS = ['d4efec', 'f9efe4', 'ffdfbf', 'c0ebdf', 'ffd5c8']

export function getMemberAvatarUrl(seed: string, index = 0): string {
  const bg = WARM_BACKGROUNDS[index % WARM_BACKGROUNDS.length]
  return `${DICEBEAR_BASE}?seed=${encodeURIComponent(seed)}&backgroundColor=${bg}&radius=50`
}

/** 護家神山品牌圖示 */
export function getFamilyMascotUrl(): string {
  return '/app-icon.png'
}

export function getAdvisorAvatarUrl(): string {
  return `${DICEBEAR_BASE}?seed=advisor-linjiajung&backgroundColor=c0ebdf&radius=50`
}