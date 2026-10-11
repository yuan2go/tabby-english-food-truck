import type { RequestId } from './catalog';
export type ShopTheme = 'all' | 'fruit' | 'cool' | 'share';
export const SHOP_THEMES: readonly {
  id: ShopTheme;
  name: string;
  requests?: readonly RequestId[];
}[] = [
  { id: 'all', name: '熟客小院' },
  {
    id: 'fruit',
    name: '晨间水果',
    requests: ['apple', 'banana', 'two', 'fruit', 'juice', 'banana-juice'],
  },
  {
    id: 'cool',
    name: '树荫甜点',
    requests: [
      'vanilla-cup',
      'strawberry-cup',
      'double-cream',
      'banana-cream',
      'vanilla-cone',
      'cup-vanilla',
      'cone-vanilla',
    ],
  },
  {
    id: 'share',
    name: '分享小食',
    requests: ['sandwich', 'salad-sandwich', 'burger', 'cheese-burger', 'juice'],
  },
];
export const themeAllows = (theme: ShopTheme, request: RequestId) => {
  const t = SHOP_THEMES.find((t) => t.id === theme);
  return !!t && (!t.requests || t.requests.includes(request));
};
