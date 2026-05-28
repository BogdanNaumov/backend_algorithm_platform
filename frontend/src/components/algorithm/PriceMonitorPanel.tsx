import React, { useEffect, useId, useMemo, useState } from 'react';
import { apiService } from '../../services/api';
import type { PriceHistoryPoint } from '../../types';
import '../../styles/components/PriceMonitorPanel.css';

const W = 420;
const H = 100; // компактнее

const PAD_L = 48;
const PAD_R = 20;
const PAD_T = 28;
const PAD_B = 40;

interface PriceMonitorPanelProps {
  algorithmId: string;
  currentPrice?: number;
}

const PriceMonitorPanel: React.FC<PriceMonitorPanelProps> = ({ algorithmId, currentPrice }) => {
  const lineGradId = `priceLineGrad-${useId().replace(/:/g, '')}`;
  const [points, setPoints] = useState<PriceHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const data = await apiService.getAlgorithmPriceHistory(algorithmId);
        if (!cancelled) setPoints(data);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : 'Не удалось загрузить историю цен');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [algorithmId]);

  const geom = useMemo(() => {
    if (!points.length) return null;
    const sorted = [...points].sort((a, b) => 
      new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
    );
    
    const ts = sorted.map(p => new Date(p.recordedAt).getTime());
    const prices = sorted.map(p => p.price);
    const t0 = ts[0];
    const t1 = ts[ts.length - 1];
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const spanT = Math.max(t1 - t0, 1);
    const spanP = Math.max(maxP - minP, 1);
    const padP = spanP * 0.12;
    const low = minP - padP;
    const high = maxP + padP;
    const rangeP = Math.max(high - low, 1);

    const xOf = (t: number) => PAD_L + ((t - t0) / spanT) * (W - PAD_L - PAD_R);
    const yOf = (pr: number) => PAD_T + (1 - (pr - low) / rangeP) * (H - PAD_T - PAD_B);

    // Основная линия
    const pathD = sorted
      .map((p, i) => {
        const x = xOf(new Date(p.recordedAt).getTime());
        const y = yOf(p.price);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');

    // Рёбра между точками
    const ribs = [];
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      const x1 = xOf(new Date(prev.recordedAt).getTime());
      const y1 = yOf(prev.price);
      const x2 = xOf(new Date(curr.recordedAt).getTime());
      const y2 = yOf(curr.price);
      ribs.push({ x1, y1, x2, y2, key: `${prev.recordedAt}-${curr.recordedAt}` });
    }

    const dots = sorted.map(p => ({
      x: xOf(new Date(p.recordedAt).getTime()),
      y: yOf(p.price),
      key: `${p.recordedAt}-${p.price}`,
    }));

    return { pathD, dots, sorted, ribs };
  }, [points]);

  return (
    <section className="price-monitor-panel">
      <div className="price-monitor-header">
        <div>
          <h2 className="price-monitor-title">Мониторинг цены</h2>
          <p className="price-monitor-sub">
            Текущая цена на площадке:{' '}
            <strong>{currentPrice != null ? `${currentPrice} ₽` : '—'}</strong>
            {points.length > 0 && (
              <span className="price-monitor-points-count"> · записей в истории: {points.length}</span>
            )}
          </p>
        </div>
        <button
          type="button"
          className="price-monitor-toggle"
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
        >
          {collapsed ? 'Развернуть график' : 'Свернуть'}
        </button>
      </div>

      {!collapsed && (
        <div className="price-monitor-body">
          {loading && <p className="price-monitor-muted">Загрузка графика…</p>}
          {err && <p className="price-monitor-error">{err}</p>}
          {!loading && !err && points.length === 0 && (
            <p className="price-monitor-muted">
              История изменений цены пока пуста. Точки появятся при изменении цены автором после публикации.
            </p>
          )}

          {!loading && !err && geom && (
            <div className="price-chart-wrap">
              <div className="price-chart-container">
                <svg
                  className="price-chart-svg"
                  width={W}
                  height={H}
                  viewBox={`0 0 ${W} ${H}`}
                  preserveAspectRatio="xMidYMid meet"
                >
                  <defs>
                    <linearGradient id={lineGradId} x1="0" x2="1" y1="0" y2="0">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                  <rect x="0" y="0" width={W} height={H} fill="transparent" rx="8" />
                  {/* Рёбра между точками */}
                  {geom.ribs.map(rib => (
                    <line key={rib.key} x1={rib.x1} y1={rib.y1} x2={rib.x2} y2={rib.y2} stroke="#64748b" strokeWidth={1.2} />
                  ))}
                  {/* Основная линия */}
                  <path
                    d={geom.pathD}
                    fill="none"
                    stroke={`url(#${lineGradId})`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Точки */}
                  {geom.dots.map(({ x, y, key }) => (
                    <circle 
                      key={key} 
                      cx={x} 
                      cy={y} 
                      r="5.5" 
                      fill="#fff" 
                      stroke="#4f46e5" 
                      strokeWidth="3" 
                    />
                  ))}
                </svg>
              </div>
              <ul className="price-chart-legend">
                {geom.sorted.slice().reverse().slice(0, 8).map((p) => (
                  <li key={`${p.recordedAt}-${p.price}`}>
                    <time dateTime={p.recordedAt}>
                      {new Date(p.recordedAt).toLocaleString('ru-RU', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                    <span>{p.price} ₽</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default PriceMonitorPanel;