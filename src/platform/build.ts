declare const __BUILD_INFO__: { sha: string; dirty: boolean; assets: string; builtAt: string };
export const BUILD_INFO = __BUILD_INFO__;
export const resourceUrl = (folder: 'assets' | 'audio', file: string): string =>
  `${import.meta.env.BASE_URL}${folder}/${file}?v=${BUILD_INFO.assets.slice(0, 16)}`;
