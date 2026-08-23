import type { Overview } from '@/lib/stats';
import type { Range } from '@/lib/range';

/**
 * Yuqoridagi olti ko'rsatkich — Dashboard va Analitikada BIR XIL.
 *
 * Alohida komponent, chunki ikki sahifada takrorlangan edi va biri
 * o'zgarganda ikkinchisi eskirib qolardi. Endi manba bitta.
 *
 * «Onlayn» ATAYIN oraliqqa bo'ysunmaydi — u «oxirgi 5 daqiqa», ya'ni
 * hozirgi holat. Kecha tanlangan bo'lsa ham u bugungi jonli sonni
 * ko'rsatadi; shuning uchun izohida shu yozilgan.
 */
export default function StatCards({
  ov,
  online,
  range,
}: {
  ov: Overview;
  online: number;
  range: Range;
}) {
  const n = (v: number) => v.toLocaleString('ru-RU');

  return (
    <div className="a-cards">
      <div className="a-card">
        <div className="a-card-k">Onlayn</div>
        <div className="a-card-v up">
          <span className="a-dot" />
          {online}
        </div>
        <div className="a-card-n">oxirgi 5 daqiqa</div>
      </div>

      <div className="a-card">
        <div className="a-card-k">Sessiyalar</div>
        <div className="a-card-v">{n(ov.sessions)}</div>
        <div className="a-card-n">{range.label}</div>
      </div>

      <div className="a-card">
        <div className="a-card-k">Botga o’tish</div>
        <div className="a-card-v tg">{n(ov.conversions)}</div>
        <div className="a-card-n">CTA bosilgan</div>
      </div>

      <div className="a-card">
        <div className="a-card-k">Konversiya</div>
        <div className="a-card-v gold">{ov.crPct}%</div>
        <div className="a-card-n">sessiya → bot</div>
      </div>

      <div className="a-card">
        <div className="a-card-k">O’rtacha vaqt</div>
        <div className="a-card-v">{ov.avgDwellSec}s</div>
        <div className="a-card-n">sahifada</div>
      </div>

      <div className="a-card">
        <div className="a-card-k">Eventlar</div>
        <div className="a-card-v">{n(ov.events)}</div>
        <div className="a-card-n">yozilgan</div>
      </div>
    </div>
  );
}
