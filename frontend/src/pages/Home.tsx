import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from "../services/api";
import { ModeratedAlgorithm } from "../types";
import '../styles/pages/Home.css';
import SiteFooter from '../components/common/SiteFooter';
import CustomSelect from '../components/common/CustomSelect';

const Home: React.FC = () => {
  const [algorithms, setAlgorithms] = useState<ModeratedAlgorithm[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [languageFilter, setLanguageFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const loadAlgorithms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Используем метод для получения всех алгоритмов с информацией о модерации
      const data = await apiService.getAllAlgorithms();
      
      // Фильтруем только одобренные алгоритмы
      const approvedAlgorithms = data.filter(algorithm => 
        algorithm.status === 'approved'
      );
      
      setAlgorithms(approvedAlgorithms);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при загрузке алгоритмов';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlgorithms();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Поиск работает на клиенте
  };

  const handleReset = () => {
    setSearchTerm('');
    setLanguageFilter('all');
    setTypeFilter('all');
  };

  // Фильтрация алгоритмов по поисковому запросу и фильтрам
  const filteredAlgorithms = algorithms.filter(algorithm => {
    // Поиск по названию, описанию и тегам
    const matchesSearch = searchTerm === '' || 
      algorithm.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      algorithm.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      algorithm.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    
    if (languageFilter !== 'all' && algorithm.language !== languageFilter) {
      return false;
    }
    
    if (typeFilter === 'free' && algorithm.isPaid) return false;
    if (typeFilter === 'paid' && !algorithm.isPaid) return false;
    
    return true;
  });

  if (loading) {
    return (
      <div className="home">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Загрузка алгоритмов...</div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="home">
      <header className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Платформа алгоритмов</h1>
          <p className="hero-subtitle">Найдите идеальное решение для вашей задачи среди проверенных алгоритмов</p>
          
          <form className="search-container" onSubmit={handleSearch}>
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Поиск алгоритмов по названию, описанию или тегам..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-btn">
                <span className="search-icon"></span>
                Найти
              </button>
            </div>
          </form>
        </div>
      </header>

      <main className="main-content">
        {error && (
          <div className="error-banner">
            <div className="error-content">
              <span className="error-icon"></span>
              <div className="error-text">
                <strong>Ошибка:</strong> {error}
              </div>
              <button onClick={() => loadAlgorithms()} className="retry-btn">
                Попробовать снова
              </button>
            </div>
          </div>
        )}

        <section className="filters-section">
          <div className="filters-container">
            <div className="filter-group">
              <label className="filter-label">Язык программирования</label>
              <CustomSelect
                value={languageFilter}
                onChange={setLanguageFilter}
                options={[
                  { value: 'all', label: 'Все языки' },
                  { value: 'C++', label: 'C/C++' },
                  { value: 'Python', label: 'Python' },
                  { value: 'Java', label: 'Java' },
                ]}
              />
            </div>
            
            <div className="filter-group">
              <label className="filter-label">Тип алгоритма</label>
              <CustomSelect
                value={typeFilter}
                onChange={setTypeFilter}
                options={[
                  { value: 'all', label: 'Все типы' },
                  { value: 'free', label: 'Бесплатные' },
                  { value: 'paid', label: 'Платные' },
                ]}
              />
            </div>
            
            <div className="results-info">
              <span className="results-count">{filteredAlgorithms.length}</span>
              <span className="results-text">алгоритмов найдено</span>
            </div>
            
            <button onClick={handleReset} className="reset-filters-btn">
              Сбросить фильтры
            </button>
          </div>
        </section>

        <section className="algorithms-section">
          {filteredAlgorithms.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"></div>
              <h3 className="empty-title">Ничего не найдено</h3>
              <p className="empty-description">
                {algorithms.length === 0 
                  ? 'Нет доступных алгоритмов. Возможно, они еще проходят модерацию.'
                  : 'Попробуйте изменить параметры поиска или фильтры'
                }
              </p>
              <button onClick={handleReset} className="primary-btn">
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <div className="algorithms-grid">
              {filteredAlgorithms.map(algorithm => (
                <AlgorithmCard key={algorithm.id} algorithm={algorithm} />
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

const AlgorithmCard: React.FC<{ algorithm: ModeratedAlgorithm }> = ({ algorithm }) => {
  return (
    <div className={`algorithm-card ${algorithm.isPaid ? 'paid' : 'free'}`}>
      <div className="card-header">
        <div className="card-title-section">
          <h3 className="card-title">{algorithm.title}</h3>
          <div className="card-meta">
            <span className="card-date">
              {new Date(algorithm.createdAt).toLocaleDateString('ru-RU')}
            </span>
            <span className="status-badge approved">Одобрено</span>
          </div>
        </div>
        <div className="card-badges">
          <span className="language-badge">{algorithm.language}</span>
          <span className={`type-badge ${algorithm.isPaid ? 'paid' : 'free'}`}>
            {algorithm.isPaid ? (algorithm.price ? `${algorithm.price} руб.` : 'Платный') : 'Бесплатный'}
          </span>
        </div>
      </div>
      
      <p className="card-description">{algorithm.description}</p>
      
      <div className="card-details">
        <div className="detail-item">
          <span className="detail-label">Автор</span>
          <span className="detail-value">{algorithm.author_name}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Компилятор</span>
          <span className="detail-value">{algorithm.compiler}</span>
        </div>
      </div>

      {algorithm.tags.length > 0 && (
        <div className="card-tags">
          {algorithm.tags.map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      )}

      <div className="card-actions">
        <Link to={`/algorithm/${algorithm.id}`} className="details-btn">
          <span>Подробнее</span>
          <span className="btn-arrow">→</span>
        </Link>
      </div>
    </div>
  );
};

export default Home;