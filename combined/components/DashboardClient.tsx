'use client';
import { useState, useMemo, useCallback } from 'react';
import { Contract, ContractCategory, ContractFilters, User } from '@/types';
import HeatMap from './HeatMap';
import ContractModal from './ContractModal';
import AddContractModal from './AddContractModal';

const CATEGORIES: ContractCategory[] = ['Contracts', 'Financial Results', 'M&A', 'New Offerings', 'Partnerships'];

const CAT_COLORS: Record<ContractCategory, string> = {
  'Contracts': '#3b82f6',
  'Financial Results': '#10b981',
  'M&A': '#8b5cf6',
  'New Offerings': '#f59e0b',
  'Partnerships': '#06b6d4',
};

function fmt(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  if (n > 0) return `$${n.toLocaleString()}`;
  return '—';
}

interface Props {
  initialContracts: Contract[];
  user: User;
}

export default function DashboardClient({ initialContracts, user }: Props) {
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [filters, setFilters] = useState<ContractFilters>({});
  const [view, setView] = useState<'list' | 'heatmap'>('list');
  const [selected, setSelected] = useState<Contract | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [prepopLoading, setPrepopLoading] = useState(false);
  const [toast, setToast] = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  const filtered = useMemo(() => {
    return contracts.filter(c => {
      const q = filters.search?.toLowerCase();
      if (q && !c.title.toLowerCase().includes(q) && !c.vendor.toLowerCase().includes(q) && !c.agency.toLowerCase().includes(q)) return false;
      if (filters.category && c.category !== filters.category) return false;
      if (filters.status && c.status !== filters.status) return false;
      if (filters.yearFrom && c.year < filters.yearFrom) return false;
      if (filters.yearTo && c.year > filters.yearTo) return false;
      return true;
    });
  }, [contracts, filters]);

  const stats = useMemo(() => ({
    total: filtered.length,
    totalValue: filtered.reduce((s, c) => s + c.value, 0),
    active: filtered.filter(c => c.status === 'active').length,
    byCategory: CATEGORIES.map(cat => ({
      cat, count: filtered.filter(c => c.category === cat).length,
    })),
  }), [filtered]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  }

  async function handlePrepopulate() {
    if (!confirm('This will add historical contracts from 2010 to now. Continue?')) return;
    setPrepopLoading(true);
    try {
      const res = await fetch('/api/contracts/prepopulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ historical: true, startYear: 2010, categories: CATEGORIES, maxPerCategoryPerYear: 2 }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✓ Added ${data.data.count} historical contracts`);
        const fresh = await fetch('/api/contracts').then(r => r.json());
        if (fresh.success) setContracts(fresh.data);
      }
    } catch {
      showToast('Error prepopulating data');
    } finally {
      setPrepopLoading(false);
    }
  }

  function handleExport() {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.category) params.set('category', filters.category);
    if (filters.status) params.set('status', filters.status);
    if (filters.yearFrom) params.set('yearFrom', String(filters.yearFrom));
    if (filters.yearTo) params.set('yearTo', String(filters.yearTo));
    window.open(`/api/export?${params}`, '_blank');
  }

  const handleContractAdded = useCallback((c: Contract) => {
    setContracts(prev => [c, ...prev]);
    setShowAdd(false);
    showToast('✓ Contract added');
  }, []);

  const handleContractDeleted = useCallback(async (id: string) => {
    await fetch(`/api/contracts/${id}`, { method: 'DELETE' });
    setContracts(prev => prev.filter(c => c.id !== id));
    setSelected(null);
    showToast('Contract deleted');
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '10px 16px', color: 'var(--text)',
          fontSize: 13, boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          animation: 'fadeIn 0.2s ease',
        }}>
          {toast}
        </div>
      )}

      {/* Navbar */}
      <nav style={{
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 16 }}>⬡</span>
          <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 12, fontWeight: 500, color: 'var(--accent)', letterSpacing: '0.06em' }}>
            CONTRACT TRACKER
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>
            <span style={{
              display: 'inline-block', padding: '2px 8px', borderRadius: 4,
              background: user.role === 'admin' ? 'rgba(59,130,246,0.15)' : 'rgba(16,185,129,0.15)',
              color: user.role === 'admin' ? 'var(--accent)' : 'var(--green)',
              fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              {user.role}
            </span>
            {' '}{user.username}
          </span>
          <button onClick={handleLogout} style={{
            background: 'none', border: '1px solid var(--border)', borderRadius: 6,
            color: 'var(--text2)', padding: '5px 12px', cursor: 'pointer', fontSize: 12,
          }}>Sign out</button>
        </div>
      </nav>

      <main style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total Records', value: stats.total, color: 'var(--accent)' },
            { label: 'Total Value', value: fmt(stats.totalValue), color: 'var(--green)' },
            { label: 'Active', value: stats.active, color: 'var(--cyan)' },
            ...stats.byCategory.map(b => ({ label: b.cat, value: b.count, color: CAT_COLORS[b.cat] })),
          ].map(s => (
            <div key={s.label} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '14px 16px',
            }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 600, color: s.color, fontFamily: 'IBM Plex Mono' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Search contracts, vendors, agencies…"
            value={filters.search ?? ''}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            style={{
              flex: '1 1 240px', padding: '8px 12px',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 8, color: 'var(--text)', outline: 'none',
            }}
          />
          <select
            value={filters.category ?? ''}
            onChange={e => setFilters(f => ({ ...f, category: e.target.value as never }))}
            style={{ padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', cursor: 'pointer' }}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={filters.status ?? ''}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value as never }))}
            style={{ padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', cursor: 'pointer' }}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="pending">Pending</option>
          </select>
          <input
            type="number"
            placeholder="From year"
            value={filters.yearFrom ?? ''}
            onChange={e => setFilters(f => ({ ...f, yearFrom: e.target.value ? Number(e.target.value) : undefined }))}
            style={{ width: 110, padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', outline: 'none' }}
          />
          <input
            type="number"
            placeholder="To year"
            value={filters.yearTo ?? ''}
            onChange={e => setFilters(f => ({ ...f, yearTo: e.target.value ? Number(e.target.value) : undefined }))}
            style={{ width: 110, padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', outline: 'none' }}
          />

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            {/* View Toggle */}
            <div style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
              {(['list', 'heatmap'] as const).map(v => (
                <button key={v} onClick={() => setView(v)} style={{
                  padding: '7px 14px', border: 'none', cursor: 'pointer', fontSize: 12,
                  background: view === v ? 'var(--border2)' : 'transparent',
                  color: view === v ? 'var(--text)' : 'var(--text2)',
                  transition: 'all 0.15s',
                }}>
                  {v === 'list' ? '☰ List' : '⊞ Heat Map'}
                </button>
              ))}
            </div>
            <button onClick={handleExport} style={secondaryBtn}>↓ Export CSV</button>
            {user.role === 'admin' && (
              <>
                <button onClick={handlePrepopulate} disabled={prepopLoading} style={secondaryBtn}>
                  {prepopLoading ? 'Loading…' : '⟳ Prepopulate'}
                </button>
                <button onClick={() => setShowAdd(true)} style={primaryBtn}>+ Add Contract</button>
              </>
            )}
          </div>
        </div>

        {/* Views */}
        {view === 'heatmap' ? (
          <HeatMap contracts={filtered} />
        ) : (
          <ContractTable contracts={filtered} onSelect={setSelected} />
        )}
      </main>

      {selected && (
        <ContractModal
          contract={selected}
          user={user}
          onClose={() => setSelected(null)}
          onDelete={handleContractDeleted}
        />
      )}
      {showAdd && (
        <AddContractModal
          onClose={() => setShowAdd(false)}
          onAdded={handleContractAdded}
        />
      )}
    </div>
  );
}

const primaryBtn: React.CSSProperties = {
  padding: '8px 16px', background: 'var(--accent)', border: 'none',
  borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 13,
};

const secondaryBtn: React.CSSProperties = {
  padding: '8px 14px', background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 8, color: 'var(--text2)', cursor: 'pointer', fontSize: 13,
};

// ── Inline Contract Table ─────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  active: 'var(--green)', expired: 'var(--text3)', pending: 'var(--yellow)',
};

function fmt2(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  if (n > 0) return `$${n.toLocaleString()}`;
  return '—';
}

function ContractTable({ contracts, onSelect }: { contracts: Contract[]; onSelect: (c: Contract) => void }) {
  if (contracts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: 'var(--text3)' }}>
        <p style={{ fontSize: 32, marginBottom: 8 }}>∅</p>
        <p>No contracts match your filters.</p>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
              {['Title', 'Vendor', 'Agency', 'Category', 'Value', 'Status', 'Year'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {contracts.map((c, i) => (
              <tr
                key={c.id}
                onClick={() => onSelect(c)}
                style={{
                  borderBottom: i < contracts.length - 1 ? '1px solid var(--border)' : 'none',
                  cursor: 'pointer', transition: 'background 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '11px 14px', maxWidth: 300 }}>
                  <div style={{ fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div>
                </td>
                <td style={{ padding: '11px 14px', color: 'var(--text2)', whiteSpace: 'nowrap' }}>{c.vendor}</td>
                <td style={{ padding: '11px 14px', color: 'var(--text2)', whiteSpace: 'nowrap' }}>{c.agency}</td>
                <td style={{ padding: '11px 14px' }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                    background: `${CAT_COLORS[c.category]}20`, color: CAT_COLORS[c.category],
                  }}>{c.category}</span>
                </td>
                <td style={{ padding: '11px 14px', fontFamily: 'IBM Plex Mono', fontSize: 12, color: 'var(--text)', whiteSpace: 'nowrap' }}>{fmt2(c.value)}</td>
                <td style={{ padding: '11px 14px' }}>
                  <span style={{ color: STATUS_COLORS[c.status], fontSize: 12, fontWeight: 500 }}>● {c.status}</span>
                </td>
                <td style={{ padding: '11px 14px', fontFamily: 'IBM Plex Mono', color: 'var(--text3)' }}>{c.year}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text3)' }}>
        {contracts.length} records
      </div>
    </div>
  );
}

const CAT_COLORS: Record<ContractCategory, string> = {
  'Contracts': '#3b82f6',
  'Financial Results': '#10b981',
  'M&A': '#8b5cf6',
  'New Offerings': '#f59e0b',
  'Partnerships': '#06b6d4',
};
