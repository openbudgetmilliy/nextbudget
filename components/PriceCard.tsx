import { Package, Telegram } from './Icons';
import { kindOf, pricePerLine, priceUnitLine, uzs, type PriceItem } from '@/lib/content';
import { tgLink } from '@/lib/tg';

export default function PriceCard({ p, bot }: { p: PriceItem; bot: string }) {
  const kind = kindOf(p.sku);
  const hot = Boolean(p.badge);

  const per = Math.round(p.priceUzs / Math.max(p.amount, 1));
  const save =
    p.oldPriceUzs && p.oldPriceUzs > p.priceUzs
      ? Math.round(((p.oldPriceUzs - p.priceUzs) / p.oldPriceUzs) * 100)
      : 0;

  return (
    <article className={hot ? 'pcard pcard-hot' : 'pcard'}>
      {p.badge && <span className="pcard-badge">{p.badge}</span>}

      <div className="pcard-top">
        {/* Ovoz sanaladi — katta raqam kartaning eng kuchli elementi.
            Xizmat sanalmaydi — o'rniga ikonka turadi. Ikkalasi birga emas. */}
        {kind === 'ovoz' ? (
          <span className="pcard-count tnum" aria-hidden>
            {p.amount}
          </span>
        ) : (
          <Package size={48} className="pcard-icon" />
        )}
      </div>

      <div>
        <div className="pcard-title">{p.title}</div>
        {/* Ovozda bu qator sarlavhani takrorlardi — faqat xizmatda ma'no qo'shadi */}
        {kind !== 'ovoz' && <div className="pcard-unit">{priceUnitLine(kind, p.amount)}</div>}
      </div>

      <div className="pcard-rule" aria-hidden />

      <div>
        <div className="pcard-price">
          <b className="tnum">{uzs(p.priceUzs)}</b>
          <span className="cur">so’m</span>
          {p.oldPriceUzs && <span className="pcard-old">{uzs(p.oldPriceUzs)}</span>}
          {save > 0 && <span className="pcard-save tnum">−{save}%</span>}
        </div>
        <div className="pcard-per">{pricePerLine(kind, per)}</div>
      </div>

      <a
        href={tgLink(bot, `p_${p.sku}`)}
        className={hot ? 'btn btn-primary btn-block' : 'btn btn-ghost btn-block'}
        data-t="cta"
        data-t-id={`price_${p.sku}`}
        data-tg
        rel="noopener"
      >
        <Telegram size={16} />
        Botda tanlash
      </a>
    </article>
  );
}
