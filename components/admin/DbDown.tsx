export default function DbDown({ error }: { error: string }) {
  return (
    <div className="a-panel">
      <div className="a-panel-h">Ma’lumotlar bazasiga ulanmadi</div>
      <div className="a-panel-b">
        <div className="a-err" style={{ marginBottom: 12 }}>
          {error}
        </div>
        <p style={{ fontSize: 13.5, color: '#93a1b8', lineHeight: 1.7 }}>
          Tekshiring:
          <br />
          <code>docker compose ps</code> — postgres va pgbouncer ishlayaptimi
          <br />
          <code>.env</code> ichida <code>DATABASE_URL</code> to’g’rimi
          <br />
          <code>npx prisma migrate deploy</code> bajarilganmi
        </p>
        <p style={{ fontSize: 13, color: '#59637a', marginTop: 12 }}>
          Landing sahifa bundan qat’i nazar ishlayapti — u statik va DB’ga bog’liq emas.
        </p>
      </div>
    </div>
  );
}
