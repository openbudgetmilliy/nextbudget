import { FAQ } from '@/lib/content';

export default function Faq() {
  return (
    <section className="sec sec-line sec-sub lazy-section" id="faq">
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">FAQ</span>
          <h2>Ko’p so’raladigan savollar</h2>
        </div>

        {/* <details> — 0 KB JS, WebView'da ham ishlaydi */}
        <div className="faq">
          {FAQ.map((f, i) => (
            <details key={f.q} name="faq" open={i === 0}>
              <summary data-t="click" data-t-id={`faq_${i + 1}`}>
                {f.q}
              </summary>
              <div className="faq-a">{f.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
