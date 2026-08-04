import { ADVANTAGES, SITE } from '@/lib/content';
import { ADV_ICONS } from './Icons';

export default function Advantages() {
  return (
    <section className="sec sec-line lazy-section" id="why">
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">Nega biz</span>
          <h2>Nega {SITE.brand}</h2>
        </div>

        {/* Ketma-ketlik EMAS — shuning uchun raqam yo'q, faqat ikonka */}
        <div className="grid-lines adv">
          {ADVANTAGES.map((a) => {
            const Icon = ADV_ICONS[a.icon as keyof typeof ADV_ICONS];
            return (
              <div className="adv-item" key={a.title}>
                <Icon size={40} className="adv-icon" />
                <h3>{a.title}</h3>
                <p>{a.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
