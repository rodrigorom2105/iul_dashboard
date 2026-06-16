import React, { useMemo, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import Card from '../../components/Card';
import Avatar from '../../components/Avatar';
import SectionLabel from '../../components/SectionLabel';
import { getRangePreset, fmtDate, fmtTime, isoToLocalInput, localInputToIso, PRESET_LABELS, type RangePresetKey } from '../../utils/time';
import { useDeleteSale, useSalesCatalog, useSalesList, useSalesSummary, useUpdateSale } from './hooks';
import type { BillingPeriod, Sale, SalesAgentRanking, SalesCatalogResponse } from './types';

const PRESETS: Exclude<RangePresetKey, 'custom'>[] = ['today', 'this_week', 'this_month', 'last_month'];
const money = (cents: number, currency = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(cents / 100);
const periodLabel: Record<BillingPeriod, string> = { month: 'mes', year: 'año', once: 'único' };

export default function SalesPage() {
  const [searchParams] = useSearchParams();
  const preset = (searchParams.get('preset') ?? 'this_month') as RangePresetKey;
  const hasRange = searchParams.has('from') && searchParams.has('to');

  if (!hasRange && preset !== 'custom') {
    const range = getRangePreset(preset as Exclude<RangePresetKey, 'custom'>);
    const params = new URLSearchParams({ preset, from: range.from, to: range.to });
    return <Navigate to={`?${params}`} replace />;
  }

  return <SalesPageContent />;
}

function SalesPageContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [editing, setEditing] = useState<Sale | null>(null);
  const from = searchParams.get('from') ?? '';
  const to = searchParams.get('to') ?? '';
  const preset = (searchParams.get('preset') ?? 'this_month') as RangePresetKey;
  const company = searchParams.get('company') ?? undefined;
  const product = searchParams.get('product') ?? undefined;
  const agentDiscordUserId = searchParams.get('agent') ?? undefined;
  const liveEnd = ['today', 'this_week', 'this_month'].includes(preset);

  const { data: catalog } = useSalesCatalog();
  const { data: summary, isLoading: summaryLoading, isError: summaryError, refetch } = useSalesSummary({ from, to, company, product, agentDiscordUserId }, liveEnd);
  const { data: list, isLoading: listLoading } = useSalesList({ from, to, company, product, agentDiscordUserId, limit: 100, offset: 0 }, liveEnd);

  function setParam(key: string, value: string) {
    setSearchParams((p) => {
      if (value) p.set(key, value);
      else p.delete(key);
      if (key === 'company') p.delete('product');
      return p;
    });
  }

  function applyPreset(key: RangePresetKey) {
    if (key === 'custom') {
      setSearchParams((p) => { p.set('preset', 'custom'); return p; });
      return;
    }
    const range = getRangePreset(key);
    setSearchParams({ preset: key, from: range.from, to: range.to, ...(company ? { company } : {}), ...(product ? { product } : {}), ...(agentDiscordUserId ? { agent: agentDiscordUserId } : {}) });
  }

  const rangeLabel = useMemo(() => from && to ? `${fmtDate(from)} – ${fmtDate(to)}` : '', [from, to]);
  const agents = useMemo(() => {
    const map = new Map<string, string>();
    summary?.rankings.byAmount.forEach((a) => map.set(a.agentDiscordUserId, a.agentDisplayName));
    summary?.rankings.byClosings.forEach((a) => map.set(a.agentDiscordUserId, a.agentDisplayName));
    list?.sales.forEach((s) => map.set(s.agentDiscordUserId, s.agentDisplayName));
    return [...map.entries()].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [summary, list]);

  return (
    <>
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(10,12,16,0.85)', backdropFilter: 'saturate(140%) blur(8px)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ padding: '14px 28px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>Ventas</h1>
          <span className="font-mono tnum" style={{ color: 'var(--text-2)', fontSize: 12, padding: '2px 8px', borderRadius: 6, background: 'var(--bg-elev)', border: '1px solid var(--border)' }}>{rangeLabel}</span>
          <div style={segmentedStyle}>{PRESETS.map((key) => <button key={key} onClick={() => applyPreset(key)} style={segButton(preset === key)}>{PRESET_LABELS[key]}</button>)}<button onClick={() => applyPreset('custom')} style={segButton(preset === 'custom')}>Personalizado</button></div>
          {preset === 'custom' && <><input type="datetime-local" defaultValue={from ? isoToLocalInput(from) : ''} onChange={(e) => e.target.value && setParam('from', localInputToIso(e.target.value))} style={inputStyle} /><input type="datetime-local" defaultValue={to ? isoToLocalInput(to) : ''} onChange={(e) => e.target.value && setParam('to', localInputToIso(e.target.value))} style={inputStyle} /></>}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <select value={company ?? ''} onChange={(e) => setParam('company', e.target.value)} style={inputStyle}><option value="">Todas las empresas</option>{catalog?.companies.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}</select>
            <select value={product ?? ''} onChange={(e) => setParam('product', e.target.value)} style={inputStyle}><option value="">Todos los productos</option>{availableProducts(catalog, company).map((p) => <option key={`${p.companyCode}-${p.code}`} value={p.code}>{p.companyCode} / {p.code}</option>)}</select>
            <select value={agentDiscordUserId ?? ''} onChange={(e) => setParam('agent', e.target.value)} style={inputStyle}><option value="">Todos los agentes</option>{agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
          </div>
        </div>
      </header>
      <main style={{ padding: '24px 28px 56px', display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1480, width: '100%', margin: '0 auto' }}>
        {summaryError ? <Card padding={32} style={{ textAlign: 'center' }}><p style={{ color: 'var(--text-3)', marginBottom: 12 }}>Error al cargar ventas.</p><button onClick={() => void refetch()} style={primaryButton}>Reintentar</button></Card> : <>
          <div className="fade-in">{summaryLoading ? <div className="skeleton" style={{ height: 112, borderRadius: 14 }} /> : <SalesMetrics summary={summary} />}</div>
          <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 20, animationDelay: '80ms' }}>
            <RankingCard title="Ranking por cierres" rows={summary?.rankings.byClosings ?? []} mode="closings" />
            <RankingCard title="Ranking por monto" rows={summary?.rankings.byAmount ?? []} mode="amount" />
          </div>
          <div className="fade-in" style={{ animationDelay: '140ms' }}>{listLoading ? <div className="skeleton" style={{ height: 420, borderRadius: 14 }} /> : <SalesTable sales={list?.sales ?? []} total={list?.total ?? 0} onEdit={setEditing} />}</div>
        </>}
        <footer style={{ paddingTop: 12, color: 'var(--text-3)', fontSize: 11, textAlign: 'center' }}>IUL Dashboard · Ventas · {fmtDate(new Date())}</footer>
      </main>
      {editing && <EditSaleModal sale={editing} catalog={catalog} onClose={() => setEditing(null)} />}
    </>
  );
}

function availableProducts(catalog?: SalesCatalogResponse, company?: string) {
  return (catalog?.companies ?? [])
    .filter((c) => !company || c.code === company)
    .flatMap((c) => c.products.map((p) => ({ ...p, companyCode: c.code })));
}

function SalesMetrics({ summary }: { summary?: { totals: { salesCount: number; totalAmountCents: number; averageTicketCents: number; activeAgents: number } } }) {
  const items = [
    ['Ventas', String(summary?.totals.salesCount ?? 0)],
    ['Monto vendido', money(summary?.totals.totalAmountCents ?? 0)],
    ['Ticket promedio', money(summary?.totals.averageTicketCents ?? 0)],
    ['Agentes con ventas', String(summary?.totals.activeAgents ?? 0)],
  ];
  return <div><SectionLabel>Resumen</SectionLabel><div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>{items.map(([label, value]) => <div key={label} style={{ background: 'var(--bg-elev)', padding: '16px 20px' }}><div style={{ color: 'var(--text-3)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>{label}</div><div className="tnum" style={{ fontSize: 28, fontWeight: 650, letterSpacing: '-0.03em' }}>{value}</div></div>)}</div></div>;
}

function RankingCard({ title, rows, mode }: { title: string; rows: SalesAgentRanking[]; mode: 'closings' | 'amount' }) {
  const max = Math.max(...rows.map((r) => mode === 'closings' ? r.salesCount : r.totalAmountCents), 1);
  return <Card><SectionLabel>{title}</SectionLabel><div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{rows.length === 0 ? <Empty text="Sin ventas en el rango" /> : rows.slice(0, 12).map((r, i) => { const value = mode === 'closings' ? r.salesCount : r.totalAmountCents; return <div key={r.agentDiscordUserId} style={{ display: 'grid', gridTemplateColumns: '32px 1fr auto', gap: 10, alignItems: 'center' }}><div className="tnum" style={{ color: 'var(--text-3)', fontSize: 12 }}>#{i + 1}</div><div style={{ minWidth: 0 }}><div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}><Avatar id={r.agentDiscordUserId} name={r.agentDisplayName} size={22} /><span style={{ fontWeight: 600 }}>{r.agentDisplayName}</span></div><div style={{ height: 5, borderRadius: 999, background: 'var(--bg-hover)', overflow: 'hidden' }}><div style={{ width: `${Math.max(4, (value / max) * 100)}%`, height: '100%', background: mode === 'closings' ? 'var(--accent)' : 'var(--info)' }} /></div></div><div className="tnum" style={{ textAlign: 'right', fontWeight: 650 }}>{mode === 'closings' ? `${r.salesCount} cierres` : money(r.totalAmountCents)}<div style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 400 }}>{mode === 'closings' ? money(r.totalAmountCents) : `${r.salesCount} cierres`}</div></div></div>; })}</div></Card>;
}

function SalesTable({ sales, total, onEdit }: { sales: Sale[]; total: number; onEdit: (sale: Sale) => void }) {
  const remove = useDeleteSale();
  return <Card padding={0}><div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}><div style={{ textTransform: 'uppercase', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--text-3)' }}>Todas las ventas</div><span className="tnum" style={{ color: 'var(--text-3)', fontSize: 12 }}>{total} registros</span></div>{sales.length === 0 ? <div style={{ padding: 24 }}><Empty text="No hay ventas registradas en este rango" /></div> : <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}><thead><tr>{['Fecha','Agente','Cliente','Empresa','Producto','Monto','Firma','Acciones'].map((h) => <th key={h} style={thStyle}>{h}</th>)}</tr></thead><tbody>{sales.map((s) => <tr key={s.id} style={{ borderTop: '1px solid var(--border)' }}><td style={tdStyle}>{fmtDate(s.soldAt)} {fmtTime(s.soldAt)}</td><td style={tdStyle}><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Avatar id={s.agentDiscordUserId} name={s.agentDisplayName} size={22} />{s.agentDisplayName}</div></td><td style={tdStyle}>{s.clientName}</td><td style={tdStyle}>{s.companyCode}</td><td style={tdStyle}>{s.productCode}</td><td style={tdStyle} className="tnum">{money(s.amountCents, s.currency)}/{periodLabel[s.billingPeriod]}</td><td style={tdStyle}>{s.signatureDate ?? s.signatureStatus}</td><td style={tdStyle}><button style={linkButton} onClick={() => onEdit(s)}>Editar</button><button style={{ ...linkButton, color: 'var(--neg)' }} disabled={remove.isPending} onClick={() => { if (confirm('¿Borrar esta venta?')) remove.mutate(s.id); }}>Borrar</button></td></tr>)}</tbody></table></div>}</Card>;
}

function EditSaleModal({ sale, catalog, onClose }: { sale: Sale; catalog?: SalesCatalogResponse; onClose: () => void }) {
  const update = useUpdateSale();
  const [form, setForm] = useState({ clientName: sale.clientName, amount: String(sale.amountCents / 100), billingPeriod: sale.billingPeriod, companyCode: sale.companyCode, productCode: sale.productCode, signatureInput: sale.signatureDate ?? sale.signatureStatus, soldAt: isoToLocalInput(sale.soldAt), notes: sale.notes ?? '' });
  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));
  async function save() {
    await update.mutateAsync({ id: sale.id, payload: { ...form, amount: Number(form.amount), billingPeriod: form.billingPeriod as BillingPeriod, soldAt: localInputToIso(form.soldAt), notes: form.notes || null } });
    onClose();
  }
  return <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 100, display: 'grid', placeItems: 'center', padding: 20 }}><Card style={{ width: 'min(560px, 100%)' }}><h2 style={{ margin: '0 0 16px', fontSize: 16 }}>Editar venta</h2><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}><Field label="Cliente" value={form.clientName} onChange={(v) => set('clientName', v)} /><Field label="Monto" value={form.amount} onChange={(v) => set('amount', v)} /><Select label="Empresa" value={form.companyCode} onChange={(v) => { set('companyCode', v); set('productCode', ''); }} options={(catalog?.companies ?? []).map((c) => [c.code, c.code])} /><Select label="Producto" value={form.productCode} onChange={(v) => set('productCode', v)} options={availableProducts(catalog, form.companyCode).map((p) => [p.code, `${p.companyCode} / ${p.code}`])} /><Select label="Periodo" value={form.billingPeriod} onChange={(v) => set('billingPeriod', v)} options={[['month','Mensual'],['year','Anual'],['once','Único']]} /><Field label="Firma/follow-up" value={form.signatureInput} onChange={(v) => set('signatureInput', v)} /><Field label="Fecha venta" type="datetime-local" value={form.soldAt} onChange={(v) => set('soldAt', v)} /><Field label="Notas" value={form.notes} onChange={(v) => set('notes', v)} /></div><div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}><button style={secondaryButton} onClick={onClose}>Cancelar</button><button style={primaryButton} disabled={update.isPending} onClick={() => void save()}>{update.isPending ? 'Guardando...' : 'Guardar'}</button></div></Card></div>;
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) { return <label style={{ display: 'flex', flexDirection: 'column', gap: 6, color: 'var(--text-2)', fontSize: 12 }}>{label}<input type={type} value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle} /></label>; }
function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[][] }) { return <label style={{ display: 'flex', flexDirection: 'column', gap: 6, color: 'var(--text-2)', fontSize: 12 }}>{label}<select value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle}><option value="">Selecciona</option>{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>; }
function Empty({ text }: { text: string }) { return <div style={{ color: 'var(--text-3)', textAlign: 'center', padding: 18 }}>{text}</div>; }

const segmentedStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 4, background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 10, padding: 3 };
const segButton = (active: boolean): React.CSSProperties => ({ padding: '5px 10px', fontSize: 12, fontWeight: 500, background: active ? 'var(--bg-hover)' : 'transparent', color: active ? 'var(--text)' : 'var(--text-2)', border: 'none', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit' });
const inputStyle: React.CSSProperties = { background: 'var(--bg-elev)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 12, padding: '6px 8px', borderRadius: 8, fontFamily: 'inherit', colorScheme: 'dark' as React.CSSProperties['colorScheme'] };
const primaryButton: React.CSSProperties = { padding: '8px 14px', background: 'var(--accent)', color: '#0a0c10', border: 'none', borderRadius: 8, fontWeight: 650, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 };
const secondaryButton: React.CSSProperties = { ...primaryButton, background: 'var(--bg-hover)', color: 'var(--text)', border: '1px solid var(--border)' };
const linkButton: React.CSSProperties = { background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, marginRight: 8 };
const thStyle: React.CSSProperties = { textAlign: 'left', padding: '10px 14px', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', fontSize: 10.5 };
const tdStyle: React.CSSProperties = { padding: '11px 14px', color: 'var(--text-2)', whiteSpace: 'nowrap' };
