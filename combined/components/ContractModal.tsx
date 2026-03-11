'use client';
import { Contract, User } from '@/types';

const CAT_COLORS: Record<string, string> = {
  'Contracts': '#3b82f6',
  'Financial Results': '#10b981',
  'M&A': '#8b5cf6',
  'New Offerings': '#f59e0b',
  'Partnerships': '#06b6d4',
};

function fmt(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n > 0) return `$${n.toLocaleString()}`;
  return '—';
}

interface Props {
  contract: Contract;
  user: User;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export default function ContractModal({ contract: c, user, onClose, onDelete }: Props) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 12, width: '100%', maxWidth: 600,
          maxHeight: '85vh', overflowY: 'auto',
          boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, paddingRight: 16 }}>
            <div style={{ marginBottom: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{
                padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                background: `${CAT_COLORS[c.category]}20`, color: CAT_COLORS[c.category],
              }}>{c.category}</span>
              <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: 'var(--surface2)', color: 'var(--text2)' }}>
                {c.status}
              </span>
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>{c.title}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 20, padding: 4, flexShrink: 0 }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            {[
              { label: 'Vendor', value: c.vendor },
              { label: 'Agency', value: c.agency },
              { label: 'Contract Value', value: fmt(c.value) },
              { label: 'Year', value: c.year },
              { label: 'Start Date', value: c.startDate },
              { label: 'End Date', value: c.endDate },
            ].map(f => (
              <div key={f.label}>
                <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{f.label}</div>
                <div style={{ fontSize: 14, color: 'var(--text)', fontFamily: typeof f.value === 'number' ? 'IBM Plex Mono' : 'inherit' }}>{f.value}</div>
              </div>
            ))}
          </div>

          {c.description && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Description</div>
              <p style={{ color: 'var(--text2)', lineHeight: 1.7, fontSize: 13 }}>{c.description}</p>
            </div>
          )}

          {c.summary && (
            <div style={{ marginBottom: 16, padding: 14, background: 'var(--surface2)', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>AI Summary</div>
              <p style={{ color: 'var(--text)', lineHeight: 1.7, fontSize: 13 }}>{c.summary}</p>
            </div>
          )}

          {c.implications && (
            <div style={{ padding: 14, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Market Implications</div>
              <p style={{ color: 'var(--text2)', lineHeight: 1.7, fontSize: 13 }}>{c.implications}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {user.role === 'admin' && (
          <div style={{ padding: '0 24px 20px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => onDelete(c.id)}
              style={{
                padding: '7px 16px', borderRadius: 7,
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                color: '#fca5a5', cursor: 'pointer', fontSize: 13,
              }}
            >
              Delete Contract
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
