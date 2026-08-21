'use client';

import { useState } from 'react';

/**
 * Havolani bir bosishda nusxalash.
 *
 * Reklama kabinetiga havola QO'LDA ko'chirilganda eng ko'p uchraydigan xato —
 * `utm_content` ni tushirib qoldirish yoki noto'g'ri kadrni qo'yish. Shuning
 * uchun havola tayyor holda beriladi va faqat nusxalanadi.
 */

/**
 * Nusxalash. `navigator.clipboard` FAQAT xavfsiz kontekstda ishlaydi —
 * admin panel hali HTTPS'siz IP orqali ochilgan bo'lsa, u `undefined`
 * bo'ladi. Shuning uchun eski `execCommand` zaxirasi qoldirilgan: tugma
 * "bosilyapti-yu, hech narsa nusxalanmayapti" holatiga tushmasin.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* zaxiraga tushamiz */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export default function CopyLink({ url }: { url: string }) {
  const [state, setState] = useState<'idle' | 'ok' | 'err'>('idle');

  async function copy() {
    const ok = await copyText(url);
    setState(ok ? 'ok' : 'err');
    setTimeout(() => setState('idle'), 1600);
  }

  return (
    <button className="a-btn sm" onClick={copy} title={url} type="button">
      {state === 'ok' ? '✓ nusxalandi' : state === 'err' ? 'qo’lda belgilang' : 'Nusxalash'}
    </button>
  );
}
