/** 
 * Временный файл объявления типов для react-bootstrap 
 * Позволяет избежать ошибок импорта при отсутствии установленного npm-пакета
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'react-bootstrap' {
  import * as React from 'react';

  export interface AlignType {
    start?: boolean;
    end?: boolean;
  }

  export interface Variant {
    primary?: string;
    secondary?: string;
    success?: string;
    danger?: string;
    warning?: string;
    info?: string;
    dark?: string;
    light?: string;
    link?: string;
  }

  export type Size = 'sm' | 'lg';

  export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
    expand?: boolean | string | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
    variant?: 'light' | 'dark';
    sticky?: string;
    fixed?: string;
    bg?: string;
    as?: React.ElementType;
    collapseOnSelect?: boolean;
  }

  export const Navbar: React.FunctionComponent<NavbarProps> & {
    Brand: React.FunctionComponent<any>;
    Toggle: React.FunctionComponent<any>;
    Collapse: React.FunctionComponent<any>;
    Text: React.FunctionComponent<any>;
  };

  export interface ContainerProps extends React.HTMLAttributes<HTMLElement> {
    fluid?: boolean | string;
    as?: React.ElementType;
  }

  export const Container: React.FunctionComponent<ContainerProps>;

  export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: string;
    size?: Size;
    active?: boolean;
    disabled?: boolean;
    href?: string;
    type?: string;
    as?: React.ElementType;
  }

  export const Button: React.FunctionComponent<ButtonProps>;

  export interface BadgeProps extends React.HTMLAttributes<HTMLElement> {
    bg?: string;
    pill?: boolean;
    as?: React.ElementType;
  }

  export const Badge: React.FunctionComponent<BadgeProps>;

  export interface DropdownProps extends React.HTMLAttributes<HTMLElement> {
    align?: AlignType | string;
    drop?: 'up' | 'down' | 'start' | 'end';
    flip?: boolean;
    onToggle?: (isOpen: boolean) => void;
    show?: boolean;
    as?: React.ElementType;
  }

  export const Dropdown: React.FunctionComponent<DropdownProps> & {
    Toggle: React.FunctionComponent<any>;
    Menu: React.FunctionComponent<any>;
    Item: React.FunctionComponent<any>;
    Header: React.FunctionComponent<any>;
    Divider: React.FunctionComponent<any>;
  };

  export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
    validated?: boolean;
    as?: React.ElementType;
  }

  export const Form: React.FunctionComponent<FormProps> & {
    Group: React.FunctionComponent<any>;
    Control: React.FunctionComponent<any>;
    Label: React.FunctionComponent<any>;
    Text: React.FunctionComponent<any>;
    Check: React.FunctionComponent<any>;
    Switch: React.FunctionComponent<any>;
    Range: React.FunctionComponent<any>;
    Select: React.FunctionComponent<any>;
  };

  export interface RowProps extends React.HTMLAttributes<HTMLElement> {
    xs?: number | any;
    sm?: number | any;
    md?: number | any;
    lg?: number | any;
    xl?: number | any;
    xxl?: number | any;
    as?: React.ElementType;
  }

  export const Row: React.FunctionComponent<RowProps>;

  export interface ColProps extends React.HTMLAttributes<HTMLElement> {
    xs?: number | any;
    sm?: number | any;
    md?: number | any;
    lg?: number | any;
    xl?: number | any;
    xxl?: number | any;
    as?: React.ElementType;
  }

  export const Col: React.FunctionComponent<ColProps>;

  export interface CardProps extends React.HTMLAttributes<HTMLElement> {
    bg?: string;
    text?: string;
    border?: string;
    as?: React.ElementType;
  }

  export const Card: React.FunctionComponent<CardProps> & {
    Header: React.FunctionComponent<any>;
    Body: React.FunctionComponent<any>;
    Title: React.FunctionComponent<any>;
    Subtitle: React.FunctionComponent<any>;
    Text: React.FunctionComponent<any>;
    Link: React.FunctionComponent<any>;
    Img: React.FunctionComponent<any>;
    Footer: React.FunctionComponent<any>;
  };

  export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: string;
    dismissible?: boolean;
    show?: boolean;
    onClose?: () => void;
    transition?: React.ElementType;
  }

  export const Alert: React.FunctionComponent<AlertProps>;

  export interface TabProps extends React.HTMLAttributes<HTMLElement> {
    activeKey?: string;
    defaultActiveKey?: string;
    transition?: boolean | React.ElementType;
    onSelect?: (key: string) => void;
    mountOnEnter?: boolean;
    unmountOnExit?: boolean;
  }

  export const Tab: React.FunctionComponent<TabProps> & {
    Container: React.FunctionComponent<any>;
    Content: React.FunctionComponent<any>;
    Pane: React.FunctionComponent<any>;
  };

  export interface NavProps extends React.HTMLAttributes<HTMLElement> {
    activeKey?: string;
    defaultActiveKey?: string;
    onSelect?: (key: string) => void;
    variant?: 'tabs' | 'pills' | 'underline';
    fill?: boolean;
    justify?: boolean;
    navbar?: boolean;
    as?: React.ElementType;
  }

  export const Nav: React.FunctionComponent<NavProps> & {
    Item: React.FunctionComponent<any>;
    Link: React.FunctionComponent<any>;
  };

  export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
    striped?: boolean;
    bordered?: boolean;
    hover?: boolean;
    size?: string;
    variant?: string;
    responsive?: boolean | string;
  }

  export const Table: React.FunctionComponent<TableProps>;

  export interface InputGroupProps extends React.HTMLAttributes<HTMLElement> {
    size?: 'sm' | 'lg';
    hasValidation?: boolean;
    as?: React.ElementType;
  }

  export const InputGroup: React.FunctionComponent<InputGroupProps> & {
    Text: React.FunctionComponent<any>;
    Checkbox: React.FunctionComponent<any>;
    Radio: React.FunctionComponent<any>;
  };
} 