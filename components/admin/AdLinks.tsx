'use client';

import { useMemo, useState } from 'react';
import { adLink, type LandingPage } from '@/lib/pages';
import { copyText } from './CopyLink';

/**
 * Har kadr uchun tayyor reklama havolasi.
 *
 * Yettita kadr yettita alohida joydan yuritiladi (alohida post, alohida
 * kampaniya). Statistikada ular ajralib turishi uchun havolada ikkita narsa
 * bo'lishi shart:
 *
 *   · yo'lning o'zi (`/7`) → `Session.landedAt` → «qaysi kadrdan keldi»
 *   · `utm_content=p7`     → Meta/Instagram kabinetidagi kesim bilan bog'lash
 *
 * Manba va kampaniya nomini admin shu yerda tanlaydi, yettala havola
 * darhol qayta yig'iladi — qo'lda yozilsa, birida `utm_content` yozilmay
 * qolib, o'sha kadr statistikadan tushib qolardi.
 */

const SOURCES = ['instagram', 'telegram', 'facebook', 'tiktok', 'youtube'];

export default function AdLinks({ siteUrl, pages }: { siteUrl: string; pages: LandingPage[] }) {
  const [source, setSource] = useState('instagram');
  const [medium, setMedium] = useState('cpc');
  const [campaign, setCampaign] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const utm = { source, medium, campaign };
  const links = useMemo(
    () => pages.map((p) => ({ page: p, url: adLink(siteUrl, p, utm) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pages, siteUrl, source, medium, campaign],
  );

  async function onCopy(key: string, text: string) {
    const ok = await copyText(text);
    setCopied(ok ? key : 'err');
    setTimeout(() => setCopied(null), 1600);
  }

  return (
    <div className="a-panel">
      <div className="a-panel-h">
        <span>Reklama havolalari</span>
        <button
          className="a-btn sm"
          onClick={() =>
            onCopy('all', links.map((l) => `${l.page.name}: ${l.url}`).join('\n'))
          }
        >
          {copied === 'all' ? 'Nusxalandi ✓' : 'Hammasini nusxalash'}
        </button>
      </div>

      <div className="a-panel-b">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <div>
            <label className="a-lbl" htmlFor="utm-source">
              Manba <code style={{ color: '#3f4a5c' }}>utm_source</code>
            </label>
            <input
              id="utm-source"
              className="a-in"
              list="utm-sources"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            />
            <datalist id="utm-sources">
              {SOURCES.map((x) => (
                <option key={x} value={x} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="a-lbl" htmlFor="utm-medium">
              Turi <code style={{ color: '#3f4a5c' }}>utm_medium</code>
            </label>
            <input
              id="utm-medium"
              className="a-in"
              value={medium}
              onChange={(e) => setMedium(e.target.value)}
            />
          </div>
          <div>
            <label className="a-lbl" htmlFor="utm-campaign">
              Kampaniya <code style={{ color: '#3f4a5c' }}>utm_campaign</code>
            </label>
            <input
              id="utm-campaign"
              className="a-in"
              placeholder="masalan: avgust_reels"
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
            />
          </div>
        </div>

        {copied === 'err' && (
          <div className="a-err" style={{ marginTop: 12 }}>
            Nusxalanmadi — havolani qo’lda belgilab oling
          </div>
        )}

        <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
          {links.map(({ page, url }) => (
            <div
              key={page.path}
              style={{
                display: 'grid',
                gridTemplateColumns: '150px 1fr auto auto',
                gap: 10,
                alignItems: 'center',
              }}
            >
              <div>
                <span style={{ fontWeight: 600 }}>{page.name}</span>
                <span className="muted" style={{ display: 'block', fontSize: 12 }}>
                  {page.path} · {page.slug}
                </span>
              </div>
              <input className="a-in" readOnly value={url} onFocus={(e) => e.target.select()} />
              <button className="a-btn sm" onClick={() => onCopy(page.path, url)}>
                {copied === page.path ? 'Nusxalandi ✓' : 'Nusxalash'}
              </button>
              <a className="a-btn sm" href={url} target="_blank" rel="noopener">
                Ochish ↗
              </a>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 12.5, color: '#59637a', marginTop: 16, lineHeight: 1.6 }}>
          Har kadr uchun alohida havola oling va alohida joyga qo’ying. Tugma bosilganda odam
          botga <code>?start={'{slug}'}</code> bilan tushadi — bot ham qaysi kadrdan kelganini
          ko’radi. Statistika pastda, «Sahifalar bo’yicha» jadvalida.
        </p>
      </div>
    </div>
  );
}
