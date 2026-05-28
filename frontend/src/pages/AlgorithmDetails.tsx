import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { ModeratedAlgorithm } from '../types';
import { useAuth } from '../stores/AuthContext';
import PriceMonitorPanel from '../components/algorithm/PriceMonitorPanel';
import '../styles/pages/AlgorithmDetails.css';

const AlgorithmDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [algorithm, setAlgorithm] = useState<ModeratedAlgorithm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [priceChartNonce, setPriceChartNonce] = useState(0);
  const [stdinValue, setStdinValue] = useState('');
  const [runLoading, setRunLoading] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [runResult, setRunResult] = useState<{
    compiled: boolean;
    ran: boolean;
    stdout?: string;
    stderr?: string;
  } | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    const fetchAlgorithm = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await apiService.getAlgorithmById(id);
        setAlgorithm(data);
      } catch (err) {
        setError('Ошибка загрузки алгоритма');
        console.error('Failed to fetch algorithm:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlgorithm();
  }, [id, user?.username]);

  const handlePurchase = async () => {
    if (!id || !user) return;
    setPurchaseLoading(true);
    setPurchaseError(null);
    try {
      const updated = await apiService.purchaseAlgorithm(id);
      setAlgorithm(updated);
      setPriceChartNonce((n) => n + 1);
    } catch (err) {
      setPurchaseError(err instanceof Error ? err.message : 'Не удалось оформить покупку');
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!algorithm?.code) return;
    try {
      await navigator.clipboard.writeText(algorithm.code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleRun = async () => {
    if (!id || !algorithm?.code) return;
    setRunLoading(true);
    setRunError(null);
    setRunResult(null);
    try {
      const res = await apiService.runAlgorithm(id, {
        language: algorithm.language,
        compiler: algorithm.compiler,
        stdin: stdinValue,
      });
      setRunResult({
        compiled: Boolean(res.compiled),
        ran: Boolean(res.ran),
        stdout: res.stdout ?? '',
        stderr: res.stderr ?? '',
      });
    } catch (err) {
      setRunError(err instanceof Error ? err.message : 'Не удалось запустить алгоритм');
    } finally {
      setRunLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="algorithm-details">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Загрузка алгоритма...</p>
        </div>
      </div>
    );
  }

  if (error || !algorithm) {
    return (
      <div className="algorithm-details">
        <div className="error-container">
          <div className="error-icon" aria-hidden="true">⚠️</div>
          <p className="error-text">{error || 'Алгоритм не найден'}</p>
          <button onClick={() => navigate('/')} className="back-btn error-btn">
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  const canViewCode = !algorithm.isPaid || Boolean(algorithm.codeVisible);
  const showCodeBlock = canViewCode && Boolean(algorithm.code?.trim());
  const showPaywall = algorithm.isPaid && !canViewCode;

  return (
    <div className="algorithm-details">
      <header className="top-bar">
        <button
          type="button"
          className="back-link"
          onClick={() => navigate(-1)}
          aria-label="Вернуться назад"
        >
          <span className="back-arrow" aria-hidden="true">←</span>
          Назад
        </button>
        <h1 className="algorithm-title">{algorithm.title}</h1>

        <div className="meta-panel">
          <div className="meta-info">
            <span className="meta-item">
              <span className="meta-icon" aria-hidden="true">👤</span>
              {algorithm.author}
            </span>
            <span className="meta-separator" aria-hidden="true">·</span>
            <span className="meta-item">
              <span className="meta-icon" aria-hidden="true">📅</span>
              {new Date(algorithm.createdAt).toLocaleDateString('ru-RU')}
            </span>
          </div>

          <div className="details-inline">
            <div className="detail-item">
              <span className="detail-label">Тип</span>
              <span className={`detail-value ${algorithm.isPaid ? 'paid' : 'free'}`}>
                {algorithm.isPaid ? 'Платный' : 'Бесплатный'}
              </span>
            </div>
            {algorithm.isPaid && algorithm.price && (
              <div className="detail-item detail-price">
                <span className="detail-label">Цена</span>
                <span className="detail-value price">
                  <span className="price-amount">{algorithm.price}</span>
                  <span className="price-currency">₽</span>
                </span>
              </div>
            )}
            <div className="detail-item">
              <span className="detail-label">Обновлён</span>
              <span className="detail-value">
                {new Date(algorithm.updatedAt).toLocaleDateString('ru-RU')}
              </span>
            </div>
          </div>

          {algorithm.tags.length > 0 && (
            <div className="tags-inline">
              {algorithm.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="main-wide">
        <section className="card description-card">
          <h2 className="card-title">Описание</h2>
          <p className="description-text">{algorithm.description}</p>
        </section>

        {algorithm.isPaid && (
          <PriceMonitorPanel
            key={`${algorithm.id}-${priceChartNonce}-${algorithm.updatedAt}`}
            algorithmId={algorithm.id}
            currentPrice={algorithm.price}
          />
        )}

        {showPaywall && (
          <section className="card paywall-card">
            <h2 className="card-title">Исходный код</h2>
            <p className="paywall-note">
              Этот код доступен после покупки.
            </p>
            {purchaseError && (
              <div className="error-inline" role="alert">
                {purchaseError}
              </div>
            )}
            {user ? (
              <button
                type="button"
                className="buy-btn"
                onClick={handlePurchase}
                disabled={purchaseLoading}
              >
                {purchaseLoading ? 'Обработка…' : `Купить за ${algorithm.price ?? '—'} ₽`}
              </button>
            ) : (
              <p className="paywall-login">
                <Link to="/login">Войдите</Link>, чтобы купить алгоритм.
              </p>
            )}
          </section>
        )}

        {showCodeBlock && (
          <section className="card code-card">
            <div className="card-header">
              <h2 className="card-title">Исходный код</h2>
              <div className="code-meta">
                <span className="lang-badge">{algorithm.language}</span>
                <span className="compiler-badge">{algorithm.compiler}</span>
              </div>
            </div>
            <div className="code-wrapper">
              <button
                className={`copy-btn ${isCopied ? 'copied' : ''}`}
                onClick={handleCopyCode}
                title="Копировать код"
                aria-label={isCopied ? 'Код скопирован' : 'Копировать код'}
              >
                <span className="copy-icon" aria-hidden="true">{isCopied ? '✓' : '📋'}</span>
                {isCopied ? 'Скопировано!' : 'Копировать'}
              </button>
              <pre className="code-block">
                <code>{algorithm.code}</code>
              </pre>
            </div>

            <div className="run-section">
              <h3 className="run-title">Запуск алгоритма</h3>
              <label htmlFor="stdin-input" className="stdin-label">
                Стандартный ввод (stdin)
              </label>
              <textarea
                id="stdin-input"
                className="stdin-textarea"
                value={stdinValue}
                onChange={(e) => setStdinValue(e.target.value)}
                rows={4}
                placeholder="Введите данные, которые будут переданы программе"
              />
              <div className="run-actions">
                <button
                  type="button"
                  className="run-btn"
                  onClick={handleRun}
                  disabled={runLoading}
                >
                  <span className="run-btn-icon" aria-hidden="true">▶</span>
                  {runLoading ? 'Выполняется…' : 'Запустить код'}
                </button>
                {runError && (
                  <div className="run-error" role="alert">
                    {runError}
                  </div>
                )}
              </div>

              {runResult && (
                <div className="run-result animate-fade-in">
                  <div className="run-result-status">
                    <strong>Результат:</strong>{' '}
                    <span className={`run-status-badge ${
                      runResult.compiled && runResult.ran ? 'success' : 'error'
                    }`}>
                      {!runResult.compiled
                        ? 'Ошибка компиляции'
                        : runResult.ran
                          ? 'Выполнено'
                          : 'Ошибка выполнения'}
                    </span>
                  </div>
                  {runResult.stderr?.trim() && (
                    <div className="run-output-block">
                      <div className="run-output-label">stderr</div>
                      <pre className="run-output-text">{runResult.stderr}</pre>
                    </div>
                  )}
                  {runResult.stdout?.trim() && (
                    <div className="run-output-block">
                      <div className="run-output-label">stdout</div>
                      <pre className="run-output-text">{runResult.stdout}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default AlgorithmDetails;