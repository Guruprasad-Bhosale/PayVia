"use client";

import React, { isValidElement, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import "./BranchedMenu.css";

export interface BranchedMenuItem {
  value?: string;
  label: string;
  icon?: any;
  children?: BranchedMenuItem[];
}

export interface BranchedMenuProps {
  items?: BranchedMenuItem[];
  defaultOpen?: number | number[];
  defaultActive?: string;
  onSelect?: (value: string, item: BranchedMenuItem) => void;
  onToggle?: (index: number, isOpen: boolean) => void;
  color?: string;
  accentColor?: string;
  lineColor?: string;
  width?: number;
  rowHeight?: number;
  indent?: number;
  trunk?: number;
  radius?: number;
  lineWidth?: number;
  fontSize?: number;
  drawDuration?: number;
  foldDuration?: number;
  className?: string;
  style?: CSSProperties;
}

const PAD = 6;
const MARK = 16;

const renderIcon = (icon: any): ReactNode =>
  isValidElement(icon) ? icon : icon ? <HugeiconsIcon icon={icon} size={16} strokeWidth={1.8} /> : null;

const toSet = (open: number | number[] | undefined): Set<number> =>
  new Set(Array.isArray(open) ? open : typeof open === "number" && open >= 0 ? [open] : []);

export default function BranchedMenu({
  items = [],
  defaultOpen = 0,
  defaultActive = "",
  onSelect,
  onToggle,
  color = "#111827",
  accentColor = "#0070E0",
  lineColor = "#CBD5E1",
  width = 240,
  rowHeight = 34,
  indent = 36,
  trunk = 14,
  radius = 10,
  lineWidth = 1.5,
  fontSize = 13,
  drawDuration = 400,
  foldDuration = 300,
  className = "",
  style
}: BranchedMenuProps) {
  const [open, setOpen] = useState<Set<number>>(() => toSet(defaultOpen));
  const [active, setActive] = useState<string>(() => {
    if (defaultActive) return defaultActive;
    const first = items.find((it, i) => it.children && toSet(defaultOpen).has(i));
    return first?.children?.[0]?.value ?? "";
  });
  const navRef = useRef<HTMLElement>(null);
  const heads = useRef<(HTMLButtonElement | null)[]>([]);
  const markerRef = useRef<HTMLSpanElement>(null);
  const latest = useRef<{ onSelect?: (value: string, item: BranchedMenuItem) => void; onToggle?: (i: number, o: boolean) => void }>({});
  latest.current = { onSelect, onToggle };

  const activeSection = items.findIndex(it => it.children?.some(kid => kid.value === active));
  const markerShown = activeSection >= 0 && open.has(activeSection);

  useLayoutEffect(() => {
    const place = (glide: boolean) => {
      const m = markerRef.current;
      const el = heads.current[activeSection];
      if (!m) return;
      const on = markerShown && el;
      if (!glide) m.style.transition = "none";
      if (on && el) m.style.top = `${el.offsetTop + (el.offsetHeight - MARK) / 2}px`;
      m.toggleAttribute("data-on", Boolean(on));
      if (!glide) {
        void m.offsetHeight;
        m.style.transition = "";
      }
    };
    place(true);
    let first = true;
    const ro = new ResizeObserver(() => {
      if (first) {
        first = false;
        return;
      }
      place(false);
    });
    if (navRef.current) ro.observe(navRef.current);
    return () => ro.disconnect();
  }, [activeSection, markerShown, items, fontSize, rowHeight]);

  const select = (value: string, item: BranchedMenuItem) => {
    setActive(value);
    latest.current.onSelect?.(value, item);
  };

  const toggle = (i: number) => {
    setOpen(prev => {
      const next = new Set(prev);
      const isOpen = !next.has(i);
      if (isOpen) next.add(i);
      else next.delete(i);
      latest.current.onToggle?.(i, isOpen);
      return next;
    });
  };

  const r = Math.min(radius, rowHeight / 2 - 2);
  const endX = indent - 8;
  const rowY = (k: number) => PAD + k * rowHeight + rowHeight / 2;
  const branch = (k: number) => `M ${trunk} ${rowY(k) - r} A ${r} ${r} 0 0 0 ${trunk + r} ${rowY(k)} H ${endX}`;
  const reach = (k: number) => `M ${trunk} 0 V ${rowY(k) - r} A ${r} ${r} 0 0 0 ${trunk + r} ${rowY(k)} H ${endX}`;
  const length = (k: number) => rowY(k) - r + (Math.PI * r) / 2 + (endX - trunk - r);

  const customStyle = {
    "--bm-w": `${width}px`,
    "--bm-ink": color,
    "--bm-accent": accentColor,
    "--bm-line": lineColor,
    "--bm-font": `${fontSize}px`,
    "--bm-row": `${rowHeight}px`,
    "--bm-indent": `${indent}px`,
    "--bm-line-w": lineWidth,
    "--bm-draw": `${drawDuration}ms`,
    "--bm-fold": `${foldDuration}ms`,
    ...style
  } as CSSProperties;

  return (
    <nav
      ref={navRef}
      className={`branched-menu${className ? ` ${className}` : ""}`}
      style={customStyle}
    >
      <span ref={markerRef} className="branched-menu__marker" aria-hidden="true" />
      {items.map((item, i) => {
        const kids = item.children;
        const isOpen = kids ? open.has(i) : false;
        const leafValue = item.value ?? item.label;
        const leafActive = !kids && leafValue === active;
        const bodyH = kids ? PAD * 2 + kids.length * rowHeight : 0;
        return (
          <div key={item.value ?? item.label} className="branched-menu__section" data-open={isOpen ? "" : undefined}>
            <button
              ref={el => {
                heads.current[i] = el;
              }}
              type="button"
              className="branched-menu__head"
              aria-expanded={kids ? isOpen : undefined}
              aria-current={leafActive ? "true" : undefined}
              data-active={leafActive ? "" : undefined}
              onClick={() => (kids ? toggle(i) : select(leafValue, item))}
            >
              {item.label}
            </button>
            {kids ? (
              <div className="branched-menu__body">
                <div className="branched-menu__fold">
                  <div className="branched-menu__tree" style={{ height: bodyH }}>
                    <svg className="branched-menu__lines" width={indent} height={bodyH} aria-hidden="true">
                      <path className="branched-menu__base" d={`M ${trunk} 0 V ${rowY(kids.length - 1) - r}`} />
                      {kids.map((kid, k) => (
                        <path key={kid.value ?? kid.label} className="branched-menu__base" d={branch(k)} />
                      ))}
                      {kids.map((kid, k) => (
                        <path
                          key={kid.value ?? kid.label}
                          className="branched-menu__reach"
                          d={reach(k)}
                          style={{
                            strokeDasharray: length(k),
                            strokeDashoffset: (kid.value ?? kid.label) === active ? 0 : length(k)
                          }}
                        />
                      ))}
                    </svg>
                    {kids.map(kid => (
                      <button
                        key={kid.value ?? kid.label}
                        type="button"
                        className="branched-menu__item"
                        aria-current={(kid.value ?? kid.label) === active ? "true" : undefined}
                        data-active={(kid.value ?? kid.label) === active ? "" : undefined}
                        tabIndex={isOpen ? 0 : -1}
                        onClick={() => select(kid.value ?? kid.label, kid)}
                      >
                        {kid.icon ? (
                          <span className="branched-menu__icon" aria-hidden="true">
                            {renderIcon(kid.icon)}
                          </span>
                        ) : null}
                        <span className="branched-menu__label">{kid.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
