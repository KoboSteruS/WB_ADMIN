import React from 'react';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  path?: string;
  active?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

/**
 * Компонент хлебных крошек для навигации
 */
const BreadcrumbComponent: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <Breadcrumb className="mb-3">
      {items.map((item, index) => (
        <Breadcrumb.Item 
          key={index} 
          active={item.active}
          linkAs={item.path && !item.active ? Link : undefined}
          linkProps={item.path && !item.active ? { to: item.path } : undefined}
        >
          {item.label}
        </Breadcrumb.Item>
      ))}
    </Breadcrumb>
  );
};

export default BreadcrumbComponent; 