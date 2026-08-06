import { Unbounded } from 'next/font/google';

/**
 * Bitta display shrift — Unbounded.
 *
 * Nega aynan u: sahifaning butun og'irligi BITTA raqamda — ovoz narxida.
 * Unbounded'ning raqamlari keng va geometrik, ya'ni katta o'lchamda raqam
 * matn emas, grafik shaklga aylanadi. Logotipdagi romb va lupa doirasi ham
 * shu geometriyada — belgi bilan shrift bir tilda gapiradi.
 *
 * Asosiy matn — tizim sans stack'i: yuklab olinadigan ikkinchi fayl yo'q.
 * Sahifada matn kam, shuning uchun display shrift butun xarakterni ko'taradi.
 *
 * `weight` ATAYIN cheklangan: 400 (yorliqlar) va 800 (sarlavha, narx).
 * Variable versiya butun 200–900 oralig'ini tortadi — bizga ikkitasi yetadi.
 */
export const display = Unbounded({
  subsets: ['latin'],
  weight: ['400', '800'],
  variable: '--font-display',
  display: 'swap',
});

export const fontVars = display.variable;
