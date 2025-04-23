import React from 'react';

/**
 * Страница-заглушка для компонентов, которые еще не реализованы
 */
export const StubPage: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className="stub-page">
      <div className="alert alert-info">
        <h4 className="alert-heading">В разработке</h4>
        <p>Страница "{title}" находится в разработке.</p>
      </div>
    </div>
  );
};

export default StubPage; 