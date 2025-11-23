
export enum AppStep {
  SCENE_SELECTION = 1,
  STYLE_SELECTION = 2,
  GENERATION_RESULT = 3
}

export interface SceneData {
  id: string;
  url: string; // Base64 or URL
  description: string;
  type: 'preset' | 'upload' | 'generated';
}

export interface StyleData {
  id: string;
  url: string;
  description: string;
  numPeople: number;
  type: 'preset' | 'generated';
}

export interface GeneratedItem {
  image: string;
  advice: string;
  label: string;
}

export interface ResultData {
  id: string;
  items: GeneratedItem[]; 
  createdAt: number;
}

export interface HistoryItem {
  scene: SceneData;
  style: StyleData;
  result: ResultData;
}

// Constants for presets
export const PRESET_SCENES = [
  { id: 's1', url: 'https://picsum.photos/id/10/800/600', description: '宁静的森林公园' },
  { id: 's2', url: 'https://picsum.photos/id/42/800/600', description: '现代都市咖啡馆' },
  { id: 's3', url: 'https://picsum.photos/id/180/800/600', description: '复古书房' },
  { id: 's4', url: 'https://picsum.photos/id/212/800/600', description: '街头涂鸦墙' },
];

export const PRESET_STYLES = [
  { id: 'st1', url: 'https://picsum.photos/id/338/400/400', description: '日系小清新，棉麻质感', type: 'preset' as const },
  { id: 'st2', url: 'https://picsum.photos/id/435/400/400', description: '欧美街拍，时尚潮流', type: 'preset' as const },
  { id: 'st3', url: 'https://picsum.photos/id/660/400/400', description: '极简商务，职业干练', type: 'preset' as const },
  { id: 'st4', url: 'https://picsum.photos/id/823/400/400', description: '复古港风，浓郁色彩', type: 'preset' as const },
];
