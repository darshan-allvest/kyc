/** @format */

import localFont from 'next/font/local';

// Inter variable font — body/general text ((default))
export const inter = localFont({
  src: [
    {
      path: '../../public/fonts/NeufileGrotesk/Inter-VariableFont_opsz,wght.ttf',
      style: 'normal',
    },
    {
      path: '../../public/fonts/NeufileGrotesk/Inter-Italic-VariableFont_opsz,wght.ttf',
      style: 'italic',
    },
  ],
  variable: '--font-inter',
  display: 'swap',
});

// Sora variable font — titles/headings
export const sora = localFont({
  src: [
    {
      path: '../../public/fonts/NeufileGrotesk/Sora-VariableFont_wght.ttf',
      style: 'normal',
    },
  ],
  variable: '--font-sora',
  display: 'swap',
});
