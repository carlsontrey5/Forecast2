'use client';
import { useState } from 'react';
import { Contract, ContractCategory, ContractStatus } from '@/types';

const CATEGORIES: ContractCategory[] = ['Contracts', 'Financial Results', 'M&A', 'New Offerings', 'Partnerships'];

interface Props {
  onClose: () => void;
  onAdded: (c: Contract) => void;
}

export default function AddContractModal({ onClose, onAdded }: Props) {
  const [tab, setTab] = useState<'manual' | 'ai'>('manual');
  const [pressText, setPressText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '', vendor: '', agency: '', value: '',
    category: 'Contracts' as ContractCategory,
    status: 'active' as ContractStatus,
    startDate: '', endDate: '',
    description: '',
    year: new Date().getFullYear(),
  });

  function setField(key: string, val: unknown) {
    setForm(f => ({ ...f, [key]: val }));
  }

  async function handleManualSubmit() {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, value: Number(form.value) }),
      });
      const data = await res.json();
      if (data.success) onAdded(data.data);
      else setError(data.error ?? 'Failed to create contract');
    } catch { setError('Network error'); }
    finally { setLoading(false); }
  }

  async function handleAIExtract() {
    if (!pressText.trim()) { setError('Please enter press release text'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pressReleaseText: pressText, year: new Date().getFullYear() }),
      });
      const data = await res.json();
      if (data.success) onAdded(data.data);
      else setError(data.error ?? 'Extraction failed');
    } catch { setError('Network error'); }
    finally { setLoading(false); }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px',
    background: 'var(--surface2)', border: '1px solid var(--border2)',
    borderRadius: 7, color: 'var(--text)', outline: 'none', fontSize: 13,
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11, color: 'var(--text3)',
    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5,
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.6)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Add Contract</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 20 }}>×</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          {(['manual', 'ai'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '12px', border: 'none', cursor: 'pointer', fontSize: 13,
              background: tab === t ? 'var(--surface2)' : 'transparent',
              color: tab === t ? 'var(--text)' : 'var(--text3)',
              borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
              fontWeight: tab === t ? 600 : 400,
            }}>
              {t === 'manual' ? '✎ Manual Entry' : '✦ AI Extraction'}
            </button>
          ))}
        </div>

        <div style={{ padding: 24 }}>
          {tab === 'manual' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Title *</label>
                <input style={inputStyle} value={form.title} onChange={e => setField('title', e.target.value)} placeholder="Contract title" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Vendor *</label>
                  <input style={inputStyle} value={form.vendor} onChange={e => setField('vendor', e.target.value)} placeholder="e.g. IBM" />
                </div>
                <div>
                  <label style={labelStyle}>Agency *</label>
                  <input style={inputStyle} value={form.agency} onChange={e => setField('agency', e.target.value)} placeholder="e.g. DoD" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Category</label>
                  <select style={inputStyle} value={form.category} onChange={e => setField('category', e.target.value)}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select style={inputStyle} value={form.status} onChange={e => setField('status', e.target.value)}>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Value (USD)</label>
                  <input style={inputStyle} type="number" value={form.value} onChange={e => setField('value', e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label style={labelStyle}>Start Date</label>
                  <input style={inputStyle} type="date" value={form.startDate} onChange={e => setField('startDate', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>End Date</label>
                  <input style={inputStyle} type="date" value={form.endDate} onChange={e => setField('endDate', e.target.value)} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={form.description} onChange={e => setField('description', e.target.value)} placeholder="Brief description…" />
              </div>
            </div>
          ) : (
            <div>
              <label style={labelStyle}>Paste Press Release Text</label>
              <textarea
                style={{ ...inputStyle, minHeight: 180, resize: 'vertical' }}
                value={pressText}
                onChange={e => setPressText(e.target.value)}
                placeholder="Paste the full press release text here. AI will extract contract details, generate a summary, and identify market implications…"
              />
              <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8 }}>
                {process.env.NEXT_PUBLIC_HAS_OPENAI === 'true'
                  ? '✦ OpenAI extraction active'
                  : 'Requires OPENAI_API_KEY. Falls back to rule-based extraction if not configured.'}
              </p>
            </div>
          )}

          {error && (
            <div style={{ marginTop: 14, padding: '10px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 7, color: '#fca5a5', fontSize: 13 }}>
              {error}
            </div>
          )}

          <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{ padding: '9px 18px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text2)', cursor: 'pointer', fontSize: 13 }}>
              Cancel
            </button>
            <button
              onClick={tab === 'manual' ? handleManualSubmit : handleAIExtract}
              disabled={loading}
              style={{ padding: '9px 20px', background: loading ? 'var(--border2)' : 'var(--accent)', border: 'none', borderRadius: 7, color: '#fff', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 13 }}
            >
              {loading ? 'Processing…' : tab === 'manual' ? 'Add Contract' : 'Extract & Add'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
