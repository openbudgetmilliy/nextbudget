export default function TrustStrip({ reviews }: { reviews: string }) {
  return (
    <section className="wrap sec lazy-section" aria-label="Statistika">
      <div className="grid-lines strip">
        <div>
          <b className="tnum">{reviews}</b>
          <span>mijoz</span>
        </div>
        <div>
          <b className="tnum">~45 sek</b>
          <span>o’rtacha yetkazish</span>
        </div>
        <div>
          <b className="tnum">24/7</b>
          <span>qo’llab-quvvatlash</span>
        </div>
        <div>
          <b className="tnum">4</b>
          <span>to’lov usuli</span>
        </div>
      </div>
    </section>
  );
}
