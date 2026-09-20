import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

await mkdir('public/assets', { recursive: true });
await sharp('art/source/market.png')
  .flatten({ background: '#244b38' })
  .resize(1440)
  .webp({ quality: 86 })
  .toFile('public/assets/market.webp');
const props = {
  apple: [0, 0, 510, 480],
  banana: [510, 0, 560, 480],
  cup: [1080, 0, 450, 490],
  juice: [10, 515, 495, 480],
  machine: [535, 480, 480, 544],
  tray: [1030, 580, 506, 335],
};
for (const [id, [left, top, width, height]] of Object.entries(props))
  await sharp('art/source/props.png')
    .extract({ left, top, width, height })
    .resize({ width: id === 'machine' ? 480 : id === 'tray' ? 480 : 320, withoutEnlargement: true })
    .webp({ quality: 90, alphaQuality: 100 })
    .toFile(`public/assets/${id}.webp`);
for (let row = 0; row < 2; row++)
  for (let column = 0; column < 3; column++)
    await sharp('art/source/guests.png')
      .extract({
        left: column * 512,
        top: row === 0 ? 0 : 530,
        width: 512,
        height: row === 0 ? 528 : 494,
      })
      .resize({ height: 494, withoutEnlargement: true })
      .webp({ quality: 88, alphaQuality: 100 })
      .toFile(`public/assets/guest-${row}-${column}.webp`);

await sharp('art/source/tray-hd.png')
  .resize({ width: 960, withoutEnlargement: true })
  .webp({ quality: 92, alphaQuality: 100 })
  .toFile('public/assets/tray.webp');
