'use client';

import React, { useCallback, useLayoutEffect, useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  ExternalLink,
  ShoppingBag,
  Store,
  Calendar,
  Brain,
  Code,
  Home,
  X,
} from 'lucide-react';
import './StaggeredMenu.css';

export interface StaggeredMenuItem {
  label: string;
  link: string;
  ariaLabel?: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface StaggeredMenuSocialItem {
  label: string;
  link: string;
  external?: boolean;
}

export interface StaggeredMenuProps {
  position?: 'left' | 'right';
  colors?: string[];
  items?: StaggeredMenuItem[];
  socialItems?: StaggeredMenuSocialItem[];
  displaySocials?: boolean;
  displayItemNumbering?: boolean;
  className?: string;
  isOpenControlled?: boolean;
  menuButtonColor?: string;
  openMenuButtonColor?: string;
  accentColor?: string;
  changeMenuColorOnOpen?: boolean;
  isFixed?: boolean;
  closeOnClickAway?: boolean;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
}

export const StaggeredMenu: React.FC<StaggeredMenuProps> = ({
  position = 'right',
  colors = ['#001C55', '#003087', '#0070E0'],
  items = [],
  socialItems = [],
  displaySocials = true,
  displayItemNumbering = true,
  className,
  menuButtonColor = '#003087',
  openMenuButtonColor = '#003087',
  accentColor = '#0070E0',
  changeMenuColorOnOpen = true,
  isFixed = true,
  closeOnClickAway = true,
  onMenuOpen,
  onMenuClose,
}) => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const panelRef = useRef<HTMLElement>(null);
  const preLayersRef = useRef<HTMLDivElement>(null);
  const preLayerElsRef = useRef<HTMLDivElement[]>([]);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  const busyRef = useRef(false);

  const openTlRef = useRef<gsap.core.Timeline | null>(null);
  const closeTweenRef = useRef<gsap.core.Tween | null>(null);
  const itemEntranceTweenRef = useRef<gsap.core.Tween | null>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const preContainer = preLayersRef.current;
      if (!panel) return;

      let preLayers: HTMLDivElement[] = [];
      if (preContainer) {
        preLayers = Array.from(preContainer.querySelectorAll('.sm-prelayer'));
      }
      preLayerElsRef.current = preLayers;

      const offscreen = position === 'left' ? -100 : 100;
      gsap.set([panel, ...preLayers], { xPercent: offscreen, opacity: 1 });
      if (preContainer) {
        gsap.set(preContainer, { xPercent: 0, opacity: 1 });
      }
    });
    return () => ctx.revert();
  }, [position]);

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return null;

    openTlRef.current?.kill();
    if (closeTweenRef.current) {
      closeTweenRef.current.kill();
      closeTweenRef.current = null;
    }
    itemEntranceTweenRef.current?.kill();

    const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel'));
    const descEls = Array.from(panel.querySelectorAll('.sm-panel-itemDesc'));
    const regionA = panel.querySelector('.sm-region-a');
    const regionC = panel.querySelector('.sm-region-c');

    const offscreen = position === 'left' ? -100 : 100;
    const layerStates = layers.map((el) => ({ el, start: offscreen }));
    const panelStart = offscreen;

    if (itemEls.length) gsap.set(itemEls, { yPercent: 120, opacity: 0 });
    if (descEls.length) gsap.set(descEls, { yPercent: 100, opacity: 0 });
    if (regionA) gsap.set(regionA, { opacity: 0, y: -10 });
    if (regionC) gsap.set(regionC, { opacity: 0, y: 15 });

    const tl = gsap.timeline({ paused: true });

    layerStates.forEach((ls, i) => {
      tl.fromTo(ls.el, { xPercent: ls.start }, { xPercent: 0, duration: 0.4, ease: 'power4.out' }, i * 0.06);
    });

    const lastTime = layerStates.length ? (layerStates.length - 1) * 0.06 : 0;
    const panelInsertTime = lastTime + (layerStates.length ? 0.06 : 0);
    const panelDuration = 0.55;

    tl.fromTo(
      panel,
      { xPercent: panelStart },
      { xPercent: 0, duration: panelDuration, ease: 'power4.out' },
      panelInsertTime
    );

    if (regionA) {
      tl.to(regionA, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, panelInsertTime + 0.1);
    }

    if (itemEls.length) {
      const itemsStart = panelInsertTime + 0.15;
      tl.to(
        itemEls,
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power4.out',
          stagger: { each: 0.06, from: 'start' },
        },
        itemsStart
      );

      if (descEls.length) {
        tl.to(
          descEls,
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.5,
            ease: 'power3.out',
            stagger: { each: 0.06, from: 'start' },
          },
          itemsStart + 0.08
        );
      }
    }

    if (regionC) {
      tl.to(regionC, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, panelInsertTime + 0.3);
    }

    openTlRef.current = tl;
    return tl;
  }, [position]);

  const playOpen = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    document.body.style.overflow = 'hidden';
    const tl = buildOpenTimeline();
    if (tl) {
      tl.eventCallback('onComplete', () => {
        busyRef.current = false;
      });
      tl.play(0);
    } else {
      busyRef.current = false;
    }
  }, [buildOpenTimeline]);

  const playClose = useCallback(() => {
    openTlRef.current?.kill();
    openTlRef.current = null;
    itemEntranceTweenRef.current?.kill();

    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return;

    const all = [...layers, panel];
    closeTweenRef.current?.kill();
    const offscreen = position === 'left' ? -100 : 100;
    closeTweenRef.current = gsap.to(all, {
      xPercent: offscreen,
      duration: 0.28,
      ease: 'power3.in',
      overwrite: 'auto',
      onComplete: () => {
        document.body.style.overflow = '';
        busyRef.current = false;
      },
    });
  }, [position]);

  const toggleMenu = useCallback(() => {
    const target = !openRef.current;
    openRef.current = target;
    setOpen(target);
    if (target) {
      onMenuOpen?.();
      playOpen();
    } else {
      onMenuClose?.();
      playClose();
    }
  }, [playOpen, playClose, onMenuOpen, onMenuClose]);

  const closeMenu = useCallback(() => {
    if (openRef.current) {
      openRef.current = false;
      setOpen(false);
      onMenuClose?.();
      playClose();
    }
  }, [playClose, onMenuClose]);

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && openRef.current) {
        closeMenu();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeMenu]);

  // Click outside handler
  useEffect(() => {
    if (!closeOnClickAway || !open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeOnClickAway, open, closeMenu]);

  const defaultItems: StaggeredMenuItem[] = [
    {
      label: 'Buyer Experience',
      link: '/negotiate',
      ariaLabel: 'Open Buyer Experience Room',
      description: 'Autonomous multi-merchant negotiation & offer convergence',
      icon: <ShoppingBag className="w-5 h-5 text-[#0070E0]" />,
    },
    {
      label: 'Merchant Control',
      link: '/merchant',
      ariaLabel: 'Open Merchant Control Plane',
      description: 'Private margin policy, inventory rules & AG Grid ledger',
      icon: <Store className="w-5 h-5 text-[#003087]" />,
    },
    {
      label: 'Fulfillment Engine',
      link: '/fulfillment',
      ariaLabel: 'Open Bryntum Fulfillment Engine',
      description: 'Dynamic Gantt scheduling, carrier assignment & milestones',
      icon: <Calendar className="w-5 h-5 text-[#16845B]" />,
    },
    {
      label: 'AI Vector Memory',
      link: '/memory',
      ariaLabel: 'Open Elasticsearch Vector Memory',
      description: 'Semantic intent memory & prompt injection isolation fence',
      icon: <Brain className="w-5 h-5 text-[#8B5CF6]" />,
    },
    {
      label: 'SDK & Developer API',
      link: '/merchant?tab=developer',
      ariaLabel: 'Inspect PayVia Developer SDK',
      description: 'TypeScript SDK, cryptographic schemas & webhook security',
      icon: <Code className="w-5 h-5 text-[#0F172A]" />,
    },
    {
      label: 'Commerce Overview',
      link: '/',
      ariaLabel: 'Return to Homepage Overview',
      description: 'Zero-trust architecture, transaction desk & principles',
      icon: <Home className="w-5 h-5 text-[#64748B]" />,
    },
  ];

  const menuItems = items.length > 0 ? items : defaultItems;

  const defaultSocials: StaggeredMenuSocialItem[] = [
    { label: 'PayPal Developer Portal', link: 'https://developer.paypal.com', external: true },
    { label: 'Channel3 Commerce API', link: 'https://channel3.ai', external: true },
    { label: 'Agreement Security Whitepaper', link: '/merchant?tab=developer', external: false },
  ];

  const socials = socialItems.length > 0 ? socialItems : defaultSocials;

  return (
    <div
      className={
        (className ? className + ' ' : '') +
        'staggered-menu-wrapper' +
        (isFixed ? ' fixed-wrapper' : '')
      }
      style={accentColor ? ({ ['--sm-accent']: accentColor } as unknown as React.CSSProperties) : undefined}
      data-position={position}
      data-open={open || undefined}
    >
      {/* GSAP Animated Color Underlayers */}
      <div ref={preLayersRef} className="sm-prelayers" aria-hidden="true">
        {colors.slice(0, 4).map((c, i) => (
          <div key={i} className="sm-prelayer" style={{ background: c }} />
        ))}
      </div>

      {/* Floating Upper-Left PayVia Control Trigger */}
      <div className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[60] pointer-events-auto">
        <button
          ref={toggleBtnRef}
          type="button"
          onClick={toggleMenu}
          className="group flex items-center gap-3 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-[#D9E0E9] shadow-md hover:border-[#0070E0] hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#0070E0]"
          aria-label={open ? 'Close PayVia control menu' : 'Open PayVia control menu'}
          aria-expanded={open}
          aria-controls="staggered-menu-panel"
        >
          {/* Brand Glyph */}
          <div className="w-7 h-7 rounded-lg bg-[#003087] flex items-center justify-center text-white shadow-xs group-hover:bg-[#002266] transition-colors">
            <Zap className="w-4 h-4 fill-white text-white" />
          </div>

          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold tracking-tight text-[#003087]">
                Pay<span className="text-[#0070E0]">Via</span>
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#0070E0] px-1.5 py-0.2 rounded bg-[#EFF8FF] border border-[#0070E0]/20">
                Agent Commerce
              </span>
            </div>
          </div>

          {/* Trigger Icon */}
          <div className="ml-1 pl-2 border-l border-[#E2E8F0] flex items-center gap-1.5 text-xs font-semibold text-[#5C6678] group-hover:text-[#003087]">
            {open ? (
              <X className="w-4 h-4 text-[#D92D20]" />
            ) : (
              <>
                <span className="hidden sm:inline">Menu</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#16845B] animate-pulse" />
              </>
            )}
          </div>
        </button>
      </div>

      {/* Slide-out Navigation Panel */}
      <aside
        id="staggered-menu-panel"
        ref={panelRef}
        className="staggered-menu-panel"
        aria-hidden={!open}
      >
        <div className="sm-panel-inner">
          {/* REGION A: Brand & Environment */}
          <div className="sm-region-a pb-5 border-b border-[#E2E8F0] flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#003087] flex items-center justify-center text-white">
                  <Zap className="w-4 h-4 fill-white text-white" />
                </div>
                <span className="text-lg font-extrabold tracking-tight text-[#003087]">
                  Pay<span className="text-[#0070E0]">Via</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C6678] px-2 py-0.5 rounded bg-[#F1F5F9] border border-[#E2E8F0]">
                  Agent Commerce
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#16845B] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#16845B]" />
                <span>PayPal Orders v2 Sandbox • Active</span>
              </div>
            </div>

            <button
              type="button"
              onClick={closeMenu}
              className="p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#5C6678] hover:text-[#003087] hover:bg-[#EFF8FF] transition-all"
              aria-label="Close navigation panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* REGION B: Primary Destinations */}
          <div className="sm-region-b flex-1 py-4">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748B] block mb-3">
              Navigation Index
            </span>
            <ul className="sm-panel-list" role="list">
              {menuItems.map((item, idx) => {
                const isActive =
                  item.link === '/'
                    ? pathname === '/'
                    : pathname.startsWith(item.link.split('?')[0]);

                return (
                  <li className="sm-panel-itemWrap" key={item.label + idx}>
                    <Link
                      href={item.link}
                      className={`sm-panel-item group ${
                        isActive ? 'sm-panel-item-active' : ''
                      }`}
                      aria-label={item.ariaLabel}
                      onClick={closeMenu}
                    >
                      <div className="flex items-start gap-3.5">
                        <span className="text-xs font-mono font-bold text-[#0070E0] mt-1 opacity-70 group-hover:opacity-100">
                          0{idx + 1}
                        </span>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="sm-panel-itemLabel text-xl sm:text-2xl font-bold tracking-tight text-[#101828] group-hover:text-[#0070E0] transition-colors">
                              {item.label}
                            </span>
                            <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#0070E0]" />
                          </div>
                          {item.description && (
                            <p className="sm-panel-itemDesc text-xs text-[#5C6678] font-normal leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* REGION C: Product Context & Verification Info */}
          <div className="sm-region-c pt-4 border-t border-[#E2E8F0] space-y-3">
            <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-[#003087]">Core Promise</span>
                <span className="text-[#16845B] font-mono">SHA-256 Validated</span>
              </div>
              <p className="text-xs font-semibold text-[#101828]">
                AI negotiates. PayPal settles.
              </p>
              <p className="text-[11px] text-[#5C6678] leading-tight">
                Zero client price tampering. Authoritative server verification before payment handover.
              </p>
            </div>

            {displaySocials && socials.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                  Platform Resources
                </span>
                <div className="flex flex-wrap gap-2 text-xs">
                  {socials.map((s, i) => (
                    <a
                      key={i}
                      href={s.link}
                      target={s.external ? '_blank' : undefined}
                      rel={s.external ? 'noopener noreferrer' : undefined}
                      className="inline-flex items-center gap-1 text-[#003087] hover:text-[#0070E0] font-semibold bg-white px-2.5 py-1 rounded-lg border border-[#E2E8F0] hover:border-[#0070E0] transition-all"
                    >
                      <span>{s.label}</span>
                      {s.external && <ExternalLink className="w-3 h-3 opacity-60" />}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default StaggeredMenu;
