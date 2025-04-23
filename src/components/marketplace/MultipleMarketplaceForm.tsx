import React, { useState } from 'react';
import { MarketplaceType, MarketplaceCredentialRequest } from '../../services/api/types';
import apiService from '../../services/api';

interface MarketplaceForm {
  marketplace: MarketplaceType;
  api_key: string;
  client_id?: string;
  shop_name?: string;
  warehouse_id?: string;
  inn?: string;
}

const initialForm: MarketplaceForm = {
  marketplace: MarketplaceType.WILDBERRIES,
  api_key: '',
  client_id: '',
  shop_name: '',
  warehouse_id: '',
  inn: '',
};

/**
 * Компонент для добавления нескольких маркетплейсов
 */
const MultipleMarketplaceForm: React.FC = () => {
  const [forms, setForms] = useState<MarketplaceForm[]>([{ ...initialForm }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Добавление нового маркетплейса
  const addMarketplace = () => {
    setForms([...forms, { ...initialForm }]);
  };

  // Удаление маркетплейса
  const removeMarketplace = (index: number) => {
    if (forms.length > 1) {
      const newForms = [...forms];
      newForms.splice(index, 1);
      setForms(newForms);
    }
  };

  // Обновление полей формы
  const updateForm = (index: number, field: keyof MarketplaceForm, value: string) => {
    const newForms = [...forms];
    
    if (field === 'marketplace') {
      newForms[index][field] = value as MarketplaceType;
    } else {
      newForms[index][field] = value;
    }
    
    setForms(newForms);
  };

  // Отправка форм
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Валидация форм
      const isValid = forms.every(form => {
        if (!form.api_key) return false;
        
        // Валидация ИНН если указан
        if (form.inn && !/^\d{10}$|^\d{12}$/.test(form.inn)) {
          throw new Error('ИНН должен содержать 10 или 12 цифр');
        }
        
        return true;
      });

      if (!isValid) {
        throw new Error('Пожалуйста, заполните все обязательные поля.');
      }

      // Создание массива запросов
      const requests: MarketplaceCredentialRequest[] = forms.map(form => ({
        marketplace: form.marketplace,
        api_key: form.api_key,
        client_id: form.client_id || undefined,
        shop_name: form.shop_name || undefined,
        warehouse_id: form.warehouse_id || undefined,
        inn: form.inn || undefined,
      }));

      // Отправка запроса на создание нескольких маркетплейсов
      const result = await apiService.marketplaceCredentials.createMultiple(requests);
      
      setSuccess(`Успешно добавлено ${result.length} маркетплейсов`);
      setForms([{ ...initialForm }]); // Сброс форм
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при добавлении маркетплейсов');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Получение полей в зависимости от выбранного маркетплейса
  const getFieldsForMarketplace = (type: MarketplaceType, index: number) => {
    const commonFields = (
      <>
        <div className="mb-3">
          <label className="form-label">API Ключ *</label>
          <input
            type="text"
            className="form-control"
            value={forms[index].api_key}
            onChange={(e) => updateForm(index, 'api_key', e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">ИНН</label>
          <input
            type="text"
            className="form-control"
            value={forms[index].inn || ''}
            onChange={(e) => updateForm(index, 'inn', e.target.value)}
            placeholder="10 или 12 цифр"
          />
          <small className="text-muted">ИНН должен содержать 10 или 12 цифр</small>
        </div>
      </>
    );

    switch (type) {
      case MarketplaceType.WILDBERRIES:
        return (
          <>
            {commonFields}
            <div className="mb-3">
              <label className="form-label">ID склада</label>
              <input
                type="text"
                className="form-control"
                value={forms[index].warehouse_id || ''}
                onChange={(e) => updateForm(index, 'warehouse_id', e.target.value)}
              />
            </div>
          </>
        );
      case MarketplaceType.OZON:
        return (
          <>
            {commonFields}
            <div className="mb-3">
              <label className="form-label">Client ID</label>
              <input
                type="text"
                className="form-control"
                value={forms[index].client_id || ''}
                onChange={(e) => updateForm(index, 'client_id', e.target.value)}
              />
            </div>
          </>
        );
      case MarketplaceType.YANDEX_MARKET:
      case MarketplaceType.ALIEXPRESS:
      case MarketplaceType.AVITO:
        return (
          <>
            {commonFields}
            <div className="mb-3">
              <label className="form-label">Название магазина</label>
              <input
                type="text"
                className="form-control"
                value={forms[index].shop_name || ''}
                onChange={(e) => updateForm(index, 'shop_name', e.target.value)}
              />
            </div>
          </>
        );
      default:
        return commonFields;
    }
  };

  return (
    <div className="container mt-4">
      <h2>Добавление маркетплейсов</h2>
      <p className="text-muted">Добавьте один или несколько маркетплейсов для работы с ними</p>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" role="alert">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {forms.map((form, index) => (
          <div key={index} className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Маркетплейс #{index + 1}</h5>
              {forms.length > 1 && (
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => removeMarketplace(index)}
                >
                  Удалить
                </button>
              )}
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Маркетплейс *</label>
                <select
                  className="form-select"
                  value={form.marketplace}
                  onChange={(e) => updateForm(index, 'marketplace', e.target.value)}
                  required
                >
                  <option value={MarketplaceType.WILDBERRIES}>Wildberries</option>
                  <option value={MarketplaceType.OZON}>Ozon</option>
                  <option value={MarketplaceType.YANDEX_MARKET}>Яндекс.Маркет</option>
                  <option value={MarketplaceType.ALIEXPRESS}>AliExpress</option>
                  <option value={MarketplaceType.AVITO}>Avito</option>
                </select>
              </div>
              
              {getFieldsForMarketplace(form.marketplace, index)}
            </div>
          </div>
        ))}

        <div className="mb-3">
          <button
            type="button"
            className="btn btn-outline-primary me-2"
            onClick={addMarketplace}
          >
            Добавить еще маркетплейс
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Сохранение...' : 'Сохранить все маркетплейсы'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MultipleMarketplaceForm; 