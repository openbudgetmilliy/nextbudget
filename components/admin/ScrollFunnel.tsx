import type { ScrollRow } from '@/lib/stats';

/**
 * Scroll voronkasi — Dashboard va Analitikada bir xil panel.
 *
 * Har bosqichda qancha NOYOB foydalanuvchi qolgani. Ulush eng yuqori
 * bosqichdan emas, ENG BIRINCHI bosqichdan hisoblanadi: «25% gacha
 * yetganlarning qanchasi 50% gacha bordi» degan savol shu bilan javob
 * topadi. Foizsiz faqat sonlar bo'lardi va ular kadrlar orasida
 * solishtirilmasdi.
 */
export default function ScrollFunnel({ rows, note = true }: { rows: ScrollRow[]; note?: boolean }) {
  const first = rows[0]?.users ?? 0;
  const max = Math.max(...rows.map((s) => s.users), 1);

  return (
    <div className="a-panel">
      <div className="a-panel-h">
        <span>Scroll voronkasi</span>
        {first > 0 && (
          <span style={{ fontSize: 12.5, fontWeight: 400, color: '#59637a' }}>
            boshi: {first.toLocaleString('ru-RU')}
          </span>
        )}
      </div>
      <div className="a-panel-b">
        {rows.length ? (
          rows.map((s) => (
            /* Oxirgi ustun kengaytirildi: `.a-bar` dagi standart 74px ga
               «1 458 · 32%» sig'maydi va raqam ustunchaga yopishib qolardi */
            <div className="a-bar" key={s.scrollPct} style={{ gridTemplateColumns: '52px 1fr 112px' }}>
              <span className="muted">{s.scrollPct}%</span>
              <span className="a-bar-t">
                <span className="a-bar-f" style={{ width: `${Math.round((s.users / max) * 100)}%` }} />
              </span>
              <span className="a-bar-n">
                {s.users.toLocaleString('ru-RU')}
                {first > 0 && (
                  <span className="muted"> · {Math.round((s.users / first) * 100)}%</span>
                )}
              </span>
            </div>
          ))
        ) : (
          <div className="a-empty">Ma’lumot yo’q</div>
        )}
        {note && (
          <p style={{ fontSize: 12.5, color: '#59637a', marginTop: 14, lineHeight: 1.6 }}>
            25% dan 50% ga keskin tushish — hero bo’limidan keyin qiziqish yo’qolganini
            ko’rsatadi.
          </p>
        )}
      </div>
    </div>
  );
}
