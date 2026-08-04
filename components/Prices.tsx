import PriceCard from './PriceCard';
import { PRICE_TABS, kindOf, type PriceItem } from '@/lib/content';

/**
 * Ovoz / Qo'shimcha xizmatlar tablari — radio input + CSS `:checked`.
 * JS yo'q, hydration yo'q, bosilganda darhol almashadi (WebView'da ham).
 */
export default function Prices({ prices, bot }: { prices: PriceItem[]; bot: string }) {
  const groups = PRICE_TABS.map((tab) => ({
    ...tab,
    panelClass: `panel-${tab.kind}`,
    items: prices.filter((p) => kindOf(p.sku) === tab.kind),
  })).filter((g) => g.items.length > 0);

  const multi = groups.length > 1;

  return (
    <section className="sec sec-line lazy-section" id="prices">
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">Narxlar</span>
          <h2>Paketni tanlang</h2>
          <p>
            Barcha narxlar so’mda va yakuniy. Katta paketda bitta ovoz narxi arzonroq bo’ladi.
          </p>
        </div>

        {multi ? (
          <div className="tabs">
            {groups.map((g, i) => (
              <input
                key={g.inputId}
                type="radio"
                name="ptab"
                id={g.inputId}
                defaultChecked={i === 0}
              />
            ))}

            <div className="tab-bar" role="tablist">
              {groups.map((g) => (
                <label
                  key={g.inputId}
                  htmlFor={g.inputId}
                  data-t="click"
                  data-t-id={`tab_${g.kind}`}
                >
                  {g.label}
                </label>
              ))}
            </div>

            <div className="panels">
              {groups.map((g) => (
                <div key={g.kind} className={`tab-panel ${g.panelClass}`}>
                  <div className="grid-lines price-grid">
                    {g.items.map((p) => (
                      <PriceCard key={p.id} p={p} bot={bot} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid-lines price-grid">
            {prices.map((p) => (
              <PriceCard key={p.id} p={p} bot={bot} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
