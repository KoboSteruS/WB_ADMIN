import React from 'react';

interface AlertLinkProps {
  href: string;
  target?: string;
  rel?: string;
  children: React.ReactNode;
}

/**
 * Компонент для ссылок внутри Alert, стилизованный как Alert.Link
 */
const AlertLink: React.FC<AlertLinkProps> = ({ href, target, rel, children }) => {
  return (
    <a 
      href={href} 
      target={target} 
      rel={rel}
      className="alert-link"
    >
      {children}
    </a>
  );
};

export default AlertLink; 