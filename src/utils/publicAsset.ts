/** Resolve public/ asset paths for both local dev and GitHub Pages base URL. */
export function publicAsset(path: string): string {
  const normalized = path.startsWith('/') ? path.slice(1) : path
  return `${import.meta.env.BASE_URL}${normalized}`
}