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
  Menu,
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
  accentColor?: string;
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
  className,
  accentColor = '#0070E0',
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
      tl.fromTo(ls.el, { xPercent: ls.start }, { xPercent: 0, duration: 0.35, ease: 'power4.out' }, i * 0.05);
    });

    const lastTime = layerStates.length ? (layerStates.length - 1) * 0.05 : 0;
    const panelInsertTime = lastTime + (layerStates.length ? 0.05 : 0);
    const panelDuration = 0.45;

    tl.fromTo(
      panel,
      { xPercent: panelStart },
      { xPercent: 0, duration: panelDuration, ease: 'power4.out' },
      panelInsertTime
    );

    if (regionA) {
      tl.to(regionA, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, panelInsertTime + 0.08);
    }

    if (itemEls.length) {
      const itemsStart = panelInsertTime + 0.12;
      tl.to(
        itemEls,
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'power4.out',
          stagger: { each: 0.05, from: 'start' },
        },
        itemsStart
      );

      if (descEls.length) {
        tl.to(
          descEls,
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.4,
            ease: 'power3.out',
            stagger: { each: 0.05, from: 'start' },
          },
          itemsStart + 0.06
        );
      }
    }

    if (regionC) {
      tl.to(regionC, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, panelInsertTime + 0.25);
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
      duration: 0.24,
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
      description: 'Dynamic Gantt scheduling & carrier dispatch',
      icon: <Calendar className="w-5 h-5 text-[#16845B]" />,
    },
    {
      label: 'AI Vector Memory',
      link: '/memory',
      ariaLabel: 'Open Elasticsearch Vector Memory',
      description: 'Semantic intent memory & prompt injection fence',
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
      description: 'Zero-trust architecture & negotiation desk',
      icon: <Home className="w-5 h-5 text-[#64748B]" />,
    },
  ];

  const menuItems = items.length > 0 ? items : defaultItems;

  const defaultSocials: StaggeredMenuSocialItem[] = [
    { label: 'PayPal Developer Portal', link: 'https://developer.paypal.com', external: true },
    { label: 'Channel3 Commerce API', link: 'https://channel3.ai', external: true },
    { label: 'Developer SDK Specs', link: '/merchant?tab=developer', external: false },
  ];

  const socials = socialItems.length > 0 ? socialItems : defaultSocials;

  return (
    <>
      {/* 
        ========================================================================
        TOP ACCESSIBLE BRAND BAR & MENU TRIGGER
        - Standard 44px+ touch targets
        - Brand navigates to home cleanly
        - Menu button clearly labeled
        ========================================================================
      */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Anchor */}
          <Link
            href="/"
            className="flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-[#0070E0] rounded-lg p-1"
            aria-label="PayVia Home"
            onClick={closeMenu}
          >
            <div className="w-8 h-8 rounded-lg bg-[#003087] flex items-center justify-center text-white shadow-xs">
              <Zap className="w-4 h-4 fill-white text-white" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-[#003087]">
                Pay<span className="text-[#0070E0]">Via</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C6678] px-2 py-0.5 rounded bg-[#F1F5F9] border border-[#E2E8F0] hidden sm:inline-block">
                Agent Commerce
              </span>
            </div>
          </Link>

          {/* Right Controls: PayPal Sandbox status + Clear Menu Button */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#16845B] bg-[#ECFDF5] px-3 py-1.5 rounded-full border border-[#16845B]/25 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#16845B]" />
              <span>PayPal Sandbox</span>
            </div>

            {/* Clear, Accessible Navigation Trigger (44px min height) */}
            <button
              ref={toggleBtnRef}
              type="button"
              onClick={toggleMenu}
              className={`min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#0070E0] ${
                open
                  ? 'bg-[#EFF8FF] text-[#003087] border border-[#0070E0]/30 shadow-xs'
                  : 'bg-[#F8FAFC] text-[#101828] border border-[#D9E0E9] hover:bg-[#EFF8FF] hover:text-[#003087] shadow-xs'
              }`}
              aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={open}
              aria-controls="staggered-menu-panel"
            >
              {open ? (
                <>
                  <X className="w-4 h-4 text-[#D92D20]" />
                  <span>Close</span>
                </>
              ) : (
                <>
                  <Menu className="w-4 h-4 text-[#003087]" />
                  <span>Navigation</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 
        ========================================================================
        SLIDE-OUT STAGGERED NAVIGATION OVERLAY
        - Only renders pointer-events / visible when open
        ========================================================================
      */}
      <div
        className={
          (className ? className + ' ' : '') +
          'staggered-menu-wrapper' +
          (isFixed ? ' fixed-wrapper' : '') +
          (!open ? ' sm-closed' : ' sm-open')
        }
        style={accentColor ? ({ ['--sm-accent']: accentColor } as unknown as React.CSSProperties) : undefined}
        data-position={position}
        data-open={open || undefined}
        aria-hidden={!open}
      >
        {/* GSAP Animated Color Underlayers */}
        <div ref={preLayersRef} className="sm-prelayers" aria-hidden="true">
          {colors.slice(0, 4).map((c, i) => (
            <div key={i} className="sm-prelayer" style={{ background: c }} />
          ))}
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
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#16845B] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#16845B]" />
                  <span>PayPal Orders v2 Sandbox • Active</span>
                </div>
              </div>

              <button
                type="button"
                onClick={closeMenu}
                className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#5C6678] hover:text-[#003087] hover:bg-[#EFF8FF] transition-all focus:outline-none focus:ring-2 focus:ring-[#0070E0]"
                aria-label="Close navigation panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* REGION B: Primary Destinations */}
            <div className="sm-region-b flex-1 py-4">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748B] block mb-3">
                Main Destinations
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
              <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-[#003087]">Commerce Principle</span>
                  <span className="text-[#16845B] font-mono text-[10px]">SHA-256 Sealed</span>
                </div>
                <p className="text-xs font-semibold text-[#101828]">
                  AI negotiates. PayPal settles.
                </p>
              </div>

              {displaySocials && socials.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                    Resources
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
    </>
  );
};

export default StaggeredMenu;
