'use client';

import { useState } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

/**
 * Soatlar bo'yicha trafik + konversiya.
 *
 * Dizayn qarorlari:
 *  · BITTA y-o'q — ikkala qator ham "sessiya soni", o'lchov bir xil.
 *    (Ikki o'qli grafik hech qachon ishlatilmaydi.)
 *  · Ranglar dark yuza `#0f141d` uchun validatsiyadan o'tgan:
 *    lightness band, chroma, CVD ΔE 26.8, normal ΔE 31.8, kontrast ≥3:1 — hammasi PASS.
 *  · 2 qator → legend majburiy, rang yolg'iz ma'no tashimaydi.
 *  · Jadval ko'rinishi ham bor (skrinrider va CVD uchun).
 */

const S1 = '#3987e5'; // sessiyalar
const S2 = '#d95926'; // konversiyalar
const GRID = '#1b2331';
const INK = '#7b8798';

export type Point = { h: string; sessions: number; conv: number };

const LABEL: Record<string, string> = { sessions: 'Sessiyalar', conv: 'Konversiyalar' };

function TipBox({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: '#141b26',
        border: '1px solid #253040',
        borderRadius: 10,
        padding: '9px 12px',
        fontSize: 12.5,
        boxShadow: '0 8px 24px -8px #000',
      }}
    >
      <div style={{ color: INK, marginBottom: 5 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 2 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 2,
              background: p.dataKey === 'conv' ? S2 : S1,
              flex: 'none',
            }}
          />
          <span style={{ color: '#c3cbd8' }}>{LABEL[p.dataKey] ?? p.dataKey}</span>
          <b style={{ marginLeft: 'auto', color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
            {p.value}
          </b>
        </div>
      ))}
    </div>
  );
}

export default function TrafficChart({ data }: { data: Point[] }) {
  const [table, setTable] = useState(false);

  if (!data.length) {
    return <div className="a-empty">Bu davr uchun ma’lumot yo’q</div>;
  }

  if (table) {
    return (
      <>
        <div className="a-tw" style={{ maxHeight: 300, overflowY: 'auto' }}>
          <table className="a-t">
            <thead>
              <tr>
                <th>Soat</th>
                <th className="num">Sessiyalar</th>
                <th className="num">Konversiyalar</th>
                <th className="num">CR</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.h}>
                  <td>{d.h}</td>
                  <td className="num">{d.sessions}</td>
                  <td className="num">{d.conv}</td>
                  <td className="num">
                    {d.sessions ? `${((d.conv / d.sessions) * 100).toFixed(1)}%` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="a-btn sm" style={{ marginTop: 12 }} onClick={() => setTable(false)}>
          Grafik
        </button>
      </>
    );
  }

  return (
    <>
      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: -18 }}>
            <defs>
              <linearGradient id="gSess" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={S1} stopOpacity={0.34} />
                <stop offset="100%" stopColor={S1} stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke={GRID} strokeDasharray="0" vertical={false} />
            <XAxis
              dataKey="h"
              tick={{ fill: INK, fontSize: 11 }}
              stroke="#232d3d"
              tickLine={false}
              minTickGap={26}
            />
            <YAxis
              tick={{ fill: INK, fontSize: 11 }}
              stroke="#232d3d"
              tickLine={false}
              allowDecimals={false}
              width={46}
            />
            <Tooltip content={<TipBox />} cursor={{ stroke: '#33415a', strokeWidth: 1 }} />
            <Legend
              verticalAlign="top"
              height={28}
              iconType="circle"
              iconSize={8}
              formatter={(v) => (
                <span style={{ color: '#c3cbd8', fontSize: 12.5 }}>{LABEL[v] ?? v}</span>
              )}
            />

            <Area
              type="monotone"
              dataKey="sessions"
              name="sessions"
              stroke={S1}
              strokeWidth={2}
              fill="url(#gSess)"
              activeDot={{ r: 4, strokeWidth: 2, stroke: '#0f141d' }}
            />
            <Line
              type="monotone"
              dataKey="conv"
              name="conv"
              stroke={S2}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: '#0f141d' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <button
        className="a-btn sm"
        style={{ marginTop: 4 }}
        onClick={() => setTable(true)}
        aria-label="Grafik ma’lumotlarini jadval ko’rinishida ochish"
      >
        Jadval ko’rinishi
      </button>
    </>
  );
}
