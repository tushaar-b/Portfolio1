import React, { useEffect, useRef, useState } from 'react';
import { socials } from '../../src/socials';
import './hero-social-rail.css';

export function SocialIcon({ id }: { id: string }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {id === 'linkedin' ? <><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7 10V17M11 17V10M11 13C11 9 17 9 17 13V17"/><circle cx="7" cy="7" r=".8" fill="currentColor" stroke="none"/></> : id === 'github' ? <><path d="M9 19C5 20 5 17 3 17M15 22V18Q15 16 14 15C18 15 21 13 21 9Q21 6 19 5Q20 3 19 1Q16 1 14 3Q12 2 10 3Q8 1 5 1Q4 3 5 5Q3 6 3 9C3 13 6 15 10 15Q9 16 9 18V22"/></> : <><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M3 6L12 13L21 6"/></>}
  </svg>;
}

export function HeroSocialRail() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const copyEmail = async (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();
    try {
      await navigator.clipboard.writeText(href.slice('mailto:'.length));
      if (timer.current) clearTimeout(timer.current);
      setCopied(true);
      timer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = href;
    }
  };

  return <nav className="hero-social-rail" aria-label="Social links">
    <span className="hero-social-label">FIND ME</span>
    <span className="hero-social-line" aria-hidden="true"/>
    <div className="hero-social-items">{socials.map(social => {
      const email = social.id === 'email';
      const tooltip = email ? social.href.slice('mailto:'.length) : social.label;
      return <a key={social.id} className="hero-social-link" href={social.href}
        target={email ? undefined : '_blank'} rel={email ? undefined : 'noopener noreferrer'}
        aria-label={email ? `Email ${tooltip}` : `Open ${social.label} profile`}
        onClick={email ? event => copyEmail(event, social.href) : undefined}>
        <SocialIcon id={social.id}/><span className="hero-social-tooltip" role="tooltip">{tooltip}</span>
      </a>;
    })}</div>
    <span className="hero-social-line" aria-hidden="true"/>
    <span className="hero-social-toast" role="status" aria-live="polite">{copied ? 'Email copied' : ''}</span>
  </nav>;
}
