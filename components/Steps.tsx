import { STEPS } from '@/lib/content';

export default function Steps() {
  return (
    <section className="sec sec-line sec-sub lazy-section" id="how">
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">Qanday ishlaydi</span>
          <h2>Uch qadam, uch daqiqa</h2>
        </div>

        <ol className="grid-lines steps">
          {STEPS.map((s) => (
            <li className="step" key={s.n}>
              {/* Haqiqiy ketma-ketlik — shuning uchun raqamlangan */}
              <span className="step-n tnum">{s.n.padStart(2, '0')}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
