'use client';
import { useMemo } from 'react';
import { Contract, ContractCategory } from '@/types';

const CATEGORIES: ContractCategory[] = ['Contracts', 'Financial Results', 'M&A', 'New Offerings', 'Partnerships'];

const CAT_COLORS: Record<ContractCategory, [string, string]> = {
  'Contracts':         ['#1e3a5f', '#3b82f6'],
  'Financial Results': ['#14452f', '#10b981'],
  'M&A':               ['#2e1b5e', '#8b5cf6'],
  'New Offerings':     ['#451a0a', '#f59e0b'],
  'Partnerships':      ['#083344', '#06b6d4'],
};

function interpolate(low: string, high: string, t: number): string {
  const parse = (h: string) => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
  const [r1, g1, b1] = parse(low);
  const [r2, g2, b2] = parse(high);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${b})`;
}

function fmt(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  if (n > 0) return `$${n.toLocaleString()}`;
  return '—';
}

interface Props {
  contracts: Contract[];
}

export default function HeatMap({ contracts }: Props) {
  const { years, cells, maxByCategory } = useMemo(() => {
    const yearSet = new Set<number>();
    contracts.forEach(c => yearSet.add(c.year));
    const years = Array.from(yearSet).sort((a, b) => a - b);

    const cells: Record<string, { count: number; totalValue: number }> = {};
    contracts.forEach(c => {
      const key = `${c.year}-${c.category}`;
      if (!cells[key]) cells[key] = { count: 0, totalValue: 0 };
      cells[key].count++;
      cells[key].totalValue += c.value;
    });

    const maxByCategory: Record<ContractCategory, number> = {} as never;
    CATEGORIES.forEach(cat => {
      maxByCategory[cat] = Math.max(...years.map(y => cells[`${y}-${cat}`]?.count ?? 0), 1);
    });

    return { years, cells, maxByCategory };
  }, [contracts]);

  if (years.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: 'var(--text3)' }}>
        <p style={{ fontSize: 32, marginBottom: 8 }}>∅</p>
        <p>No data to display.</p>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 24, overflowX: 'auto' }}>
      <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Activity Heat Map — Contracts by Category &amp; Year
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: `120px repeat(${years.length}, minmax(52px, 1fr))`, gap: 4 }}>
        {/* Header row */}
        <div />
        {years.map(y => (
          <div key={y} style={{ textAlign: 'center', fontSize: 11, color: 'var(--text3)', fontFamily: 'IBM Plex Mono', paddingBottom: 6 }}>{y}</div>
        ))}

        {/* Data rows */}
        {CATEGORIES.map(cat => (
          <>
            <div key={`label-${cat}`} style={{
              display: 'flex', alignItems: 'center', fontSize: 12,
              color: CAT_COLORS[cat][1], fontWeight: 500, paddingRight: 8,
            }}>{cat}</div>
            {years.map(y => {
              const cell = cells[`${y}-${cat}`];
              const count = cell?.count ?? 0;
              const t = count / maxByCategory[cat];
              const bg = count === 0 ? 'var(--surface2)' : interpolate(CAT_COLORS[cat][0], CAT_COLORS[cat][1], t);
              return (
                <div
                  key={`${y}-${cat}`}
                  title={`${cat} · ${y}\n${count} record${count !== 1 ? 's' : ''}\n${fmt(cell?.totalValue ?? 0)}`}
                  style={{
                    height: 44, borderRadius: 6, background: bg,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    cursor: count > 0 ? 'default' : 'default',
                    border: '1px solid rgba(255,255,255,0.04)',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => { if (count > 0) e.currentTarget.style.opacity = '0.8'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                >
                  {count > 0 && (
                    <>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{count}</span>
                      <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>{fmt(cell?.totalValue ?? 0)}</span>
                    </>
                  )}
                </div>
              );
            })}
          </>
        ))}
      </div>

      {/* Legend */}
      <div style={{ marginTop: 20, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {CATEGORIES.map(cat => (
          <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text2)' }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: CAT_COLORS[cat][1] }} />
            {cat}
          </div>
        ))}
      </div>
    </div>
  );
}
