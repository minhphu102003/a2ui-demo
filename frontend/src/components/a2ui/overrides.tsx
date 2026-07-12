"use client";

import { ReactNode } from "react";

interface TextProps {
  children: ReactNode;
  variant?: "h1" | "h2" | "h3" | "body" | "caption";
}

export function Text({ children, variant = "body" }: TextProps) {
  const classes = {
    h1: "text-2xl font-bold text-gray-900",
    h2: "text-xl font-semibold text-gray-800",
    h3: "text-lg font-medium text-gray-700",
    body: "text-base text-gray-600",
    caption: "text-sm text-gray-500",
  };

  return <p className={classes[variant]}>{children}</p>;
}

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
}

export function Button({ children, onClick, variant = "primary" }: ButtonProps) {
  const classes =
    variant === "primary"
      ? "bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2"
      : "bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg px-4 py-2";

  return (
    <button onClick={onClick} className={classes}>
      {children}
    </button>
  );
}

interface RowProps {
  children: ReactNode;
  gap?: number;
}

export function Row({ children, gap = 4 }: RowProps) {
  return (
    <div className={`flex flex-row gap-${gap}`}>{children}</div>
  );
}

interface ColumnProps {
  children: ReactNode;
  gap?: number;
}

export function Column({ children, gap = 4 }: ColumnProps) {
  return (
    <div className={`flex flex-col gap-${gap}`}>{children}</div>
  );
}

interface CardProps {
  children: ReactNode;
}

export function Card({ children }: CardProps) {
  return (
    <div className="rounded-xl border bg-white shadow-sm p-4">{children}</div>
  );
}

interface ListProps {
  children: ReactNode;
}

export function List({ children }: ListProps) {
  return <div className="flex flex-col gap-4">{children}</div>;
}

interface TextFieldProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export function TextField({ label, value, onChange, placeholder }: TextFieldProps) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="border rounded-lg px-4 py-2 w-full"
      />
    </div>
  );
}
