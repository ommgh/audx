export interface AudioCatalogItem {
  name: string;
  title: string;
  description: string;
  author: string;
  meta: {
    duration: number;
    sizeKb: number;
    license: string;
    tags: string[];
    keywords: string[];
  };
}

export function formatDuration(seconds: number): string {
  return `${seconds.toFixed(2)}s`;
}

export function formatSizeKb(sizeKb: number): string {
  return `${sizeKb}KB`;
}
