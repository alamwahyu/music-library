export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function apiPath(path: string) {
  return `${basePath}${path}`;
}
