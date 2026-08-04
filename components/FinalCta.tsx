import { Telegram } from './Icons';

export default function FinalCta({ tg }: { tg: string }) {
  return (
    <section className="sec sec-line lazy-section">
      <div className="wrap">
        <div className="final">
          <h2>Tashabbusingizni bugun e’lon qiling</h2>
          <p>
            Narxlarni shu sahifada ko‘rib chiqing, keyin botga o‘ting — paket, to‘lov va hisobot bir
            joyda.
          </p>
          <div className="btn-row">
            <a
              href={tg}
              className="btn btn-primary"
              data-t="cta"
              data-t-id="final_cta"
              data-tg
              rel="noopener"
            >
              <Telegram />
              Botni ochish
            </a>
            <a href="#prices" className="btn btn-ghost" data-t="click" data-t-id="final_prices">
              Narxlar
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
