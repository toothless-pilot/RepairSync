"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './landing.css';
import Link from 'next/link';

export default function LandingPage() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [scrollHeroOpacity, setScrollHeroOpacity] = useState(1);
  const [scrollHeroTransform, setScrollHeroTransform] = useState(0);
  const heroPreRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleScroll = () => {
      if (!heroPreRef.current) return;
      const preH = heroPreRef.current.offsetHeight;
      const scrollY = window.scrollY;
      const fadeStart = preH * 0.2;
      const textOpacity = Math.max(0, 1 - Math.max(0, scrollY - fadeStart) / (preH * 0.6));
      setScrollHeroOpacity(textOpacity);
      setScrollHeroTransform((1 - textOpacity) * -20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOpenModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setModalOpen(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const processFile = (file: File) => {
     if (file && file.type.startsWith('image/')) {
       const reader = new FileReader();
       reader.onload = (e) => {
         setPreview(e.target?.result as string);
       };
       reader.readAsDataURL(file);
     }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      router.push('/assessment/demo-assessment');
    }, 1500); // simulate 1.5s analysis before navigating
  };

  const clearUpload = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>


{/**/}
<nav>
  <a href="#" onClick={(e) => e.preventDefault()} className="nav-logo">Repair<em>Sync</em></a>
  <ul className="nav-links">
    <li><a href="#" onClick={(e) => e.preventDefault()}>Product</a></li>
    <li><a href="how-it-works.html">How It Works</a></li>
    <li><a href="contact.html">Contact</a></li>
  </ul>
</nav>

{/**/}
<div className="hero-scroll-wrapper">

<div className="hero-pre" ref={heroPreRef}>
  <div className="hero-text" style={{ opacity: scrollHeroOpacity, transform: `translateY(${scrollHeroTransform}px)` }}>
    <div className="hero-brand-block">
      <span className="hero-eyebrow">AI Repair Intelligence</span>
      <h1 className="hero-wordmark">Repair<br />Sync</h1>
    </div>
    <div className="hero-desc-block">
      <div className="hero-tag">
        <span className="hero-tag-dot"></span>
        Now in private beta
      </div>
      <p className="hero-copy">
        The neutral AI referee between insurers, repair shops, and drivers — delivering instant, unbiased repair quotes from photos in under 60 seconds.
      </p>
    </div>
  </div>
</div>

<section className="hero">

  <div className="model-panel" id="model-panel">
    <span className="model-panel-label">Vehicle Model</span>
    <div className="model-input-wrap">
      <input id="model-input" className="model-input" type="text" placeholder="e.g. Toyota Camry" autoComplete="off" />
      <ul id="model-suggestions" className="model-suggestions"></ul>
    </div>
    <button id="model-save-btn" className="model-save-btn" >Save</button>
    <button className="model-panel-tab"  aria-label="Toggle panel"><span className="tab-arrow">&#8249;</span></button>
  </div>

  <div id="car-model-label" className="car-model-label"></div>

  <div className="hero-visual">
    <div className="car-art">
      <svg id="car-svg" viewBox="0 0 680 380" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="glow" cx="50%" cy="60%" r="50%">
            <stop offset="0%" stop-color="#C6E83A" stop-opacity="0.12"/>
            <stop offset="100%" stop-color="#C6E83A" stop-opacity="0"/>
          </radialGradient>
          <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#2A2D38"/>
            <stop offset="100%" stop-color="#16181F"/>
          </linearGradient>
          <linearGradient id="roofGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#3C3F50"/>
            <stop offset="100%" stop-color="#22252F"/>
          </linearGradient>
          <filter id="shadow">
            <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000" flood-opacity="0.55"/>
          </filter>
        </defs>

        {/**/}
        <ellipse cx="340" cy="305" rx="280" ry="40" fill="url(#glow)"/>
        {/**/}
        <ellipse cx="340" cy="298" rx="240" ry="18" fill="black" fill-opacity="0.45"/>

        {/**/}
        <g filter="url(#shadow)" pointer-events="none">
          {/**/}
          <path d="M90 245 Q88 205 115 195 L175 178 Q225 125 300 115 L380 112 Q445 113 510 132 L565 165 L590 198 Q598 210 598 245 Z"
                fill="url(#bodyGrad)" stroke="#3A3D4E" strokeWidth="1.5"/>
          {/**/}
          <path d="M195 195 Q230 145 300 128 L390 126 Q450 128 500 168 L515 195 Z"
                fill="url(#roofGrad)" stroke="#44475A" strokeWidth="1.5"/>
          {/**/}
          <path d="M205 192 Q240 148 305 133 L390 131 Q444 131 488 165 L500 192 Z"
                fill="#1A2035" stroke="#2D3248" strokeWidth="1"/>
          {/**/}
          <path d="M225 190 Q255 155 308 140 L330 138 L295 188 Z"
                fill="white" fill-opacity="0.04"/>
          {/**/}
          <line x1="355" y1="131" x2="355" y2="243" stroke="#3A3D4E" strokeWidth="1.5"/>
          {/**/}
          <rect x="268" y="210" width="26" height="5" rx="2.5" fill="#4A4D5E" stroke="#5A5D70" strokeWidth="0.8"/>
          <rect x="400" y="210" width="26" height="5" rx="2.5" fill="#4A4D5E" stroke="#5A5D70" strokeWidth="0.8"/>
          {/**/}
          <path d="M90 245 Q88 260 96 270 L590 270 Q598 260 598 245"
                fill="#111318" stroke="#3A3D4E" strokeWidth="1.5"/>
          {/**/}
          <path d="M103 220 Q100 205 115 198 L148 194 L156 220 Z"
                fill="white" fill-opacity="0.22" stroke="white" strokeWidth="1" stroke-opacity="0.6"/>
          {/**/}
          <path d="M575 203 Q588 201 594 213 L596 237 L570 237 Z"
                fill="#FF3A3A" fill-opacity="0.22" stroke="#FF3A3A" strokeWidth="0.8" stroke-opacity="0.5"/>
          {/**/}
          <path d="M112 246 Q115 286 180 286 Q245 286 248 246"
                fill="#0A0B0F" stroke="#3A3D4E" strokeWidth="1.5"/>
          <path d="M428 246 Q431 286 496 286 Q561 286 564 246"
                fill="#0A0B0F" stroke="#3A3D4E" strokeWidth="1.5"/>
        </g>

        {/**/}
        <g pointer-events="none">
          <circle cx="180" cy="278" r="42" fill="#0F1018" stroke="#2A2D38" strokeWidth="2"/>
          <circle cx="180" cy="278" r="30" fill="none" stroke="#3A3D4E" strokeWidth="8"/>
          <circle cx="180" cy="278" r="14" fill="#1C1E27" stroke="#4A4D5E" strokeWidth="2"/>
          <line x1="180" y1="248" x2="180" y2="266" stroke="#4A4D5E" strokeWidth="2" strokeLinecap="round"/>
          <line x1="180" y1="290" x2="180" y2="308" stroke="#4A4D5E" strokeWidth="2" strokeLinecap="round"/>
          <line x1="150" y1="278" x2="168" y2="278" stroke="#4A4D5E" strokeWidth="2" strokeLinecap="round"/>
          <line x1="192" y1="278" x2="210" y2="278" stroke="#4A4D5E" strokeWidth="2" strokeLinecap="round"/>
          <line x1="159" y1="257" x2="170" y2="268" stroke="#4A4D5E" strokeWidth="2" strokeLinecap="round"/>
          <line x1="190" y1="288" x2="201" y2="299" stroke="#4A4D5E" strokeWidth="2" strokeLinecap="round"/>
          <line x1="159" y1="299" x2="170" y2="288" stroke="#4A4D5E" strokeWidth="2" strokeLinecap="round"/>
          <line x1="190" y1="268" x2="201" y2="257" stroke="#4A4D5E" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="180" cy="278" r="38" fill="none" stroke="#C6E83A" strokeWidth="1.5" stroke-opacity="0.25"/>
        </g>

        {/**/}
        <g pointer-events="none">
          <circle cx="496" cy="278" r="42" fill="#0F1018" stroke="#2A2D38" strokeWidth="2"/>
          <circle cx="496" cy="278" r="30" fill="none" stroke="#3A3D4E" strokeWidth="8"/>
          <circle cx="496" cy="278" r="14" fill="#1C1E27" stroke="#4A4D5E" strokeWidth="2"/>
          <line x1="496" y1="248" x2="496" y2="266" stroke="#4A4D5E" strokeWidth="2" strokeLinecap="round"/>
          <line x1="496" y1="290" x2="496" y2="308" stroke="#4A4D5E" strokeWidth="2" strokeLinecap="round"/>
          <line x1="466" y1="278" x2="484" y2="278" stroke="#4A4D5E" strokeWidth="2" strokeLinecap="round"/>
          <line x1="508" y1="278" x2="526" y2="278" stroke="#4A4D5E" strokeWidth="2" strokeLinecap="round"/>
          <line x1="475" y1="257" x2="486" y2="268" stroke="#4A4D5E" strokeWidth="2" strokeLinecap="round"/>
          <line x1="506" y1="288" x2="517" y2="299" stroke="#4A4D5E" strokeWidth="2" strokeLinecap="round"/>
          <line x1="475" y1="299" x2="486" y2="288" stroke="#4A4D5E" strokeWidth="2" strokeLinecap="round"/>
          <line x1="506" y1="268" x2="517" y2="257" stroke="#4A4D5E" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="496" cy="278" r="38" fill="none" stroke="#C6E83A" strokeWidth="1.5" stroke-opacity="0.25"/>
        </g>

        {/**/}
        <g pointer-events="none">
<circle id="dot-windshield"            className="saved-dot" cx="280" cy="160" r="5" fill="#C6E83A"/>
          <circle id="dot-back-passenger-window" className="saved-dot" cx="418" cy="162" r="5" fill="#C6E83A"/>
          <circle id="dot-front-door"            className="saved-dot" cx="265" cy="218" r="5" fill="#C6E83A"/>
          <circle id="dot-rear-door"             className="saved-dot" cx="408" cy="218" r="5" fill="#C6E83A"/>
          <circle id="dot-front-headlight"       className="saved-dot" cx="130" cy="208" r="5" fill="#C6E83A"/>
          <circle id="dot-rear-taillight"        className="saved-dot" cx="583" cy="220" r="5" fill="#C6E83A"/>
          <circle id="dot-rear-bumper"           className="saved-dot" cx="530" cy="258" r="5" fill="#C6E83A"/>
          <circle id="dot-front-bumper"          className="saved-dot" cx="170" cy="258" r="5" fill="#C6E83A"/>
          <circle id="dot-front-wheel"           className="saved-dot" cx="180" cy="278" r="5" fill="#C6E83A"/>
          <circle id="dot-rear-wheel"            className="saved-dot" cx="496" cy="278" r="5" fill="#C6E83A"/>
        </g>

        {/**/}
        {/**/}

        {/**/}
        <path className="car-part" data-part="windshield"
          d="M210 191 Q244 148 308 133 L355 131 L355 191 Z"/>

        {/**/}
        <path className="car-part" data-part="back-passenger-window"
          d="M355 131 L391 130 Q444 131 488 165 L500 192 L355 192 Z"/>

        {/**/}
        <path className="car-part" data-part="front-door"
          d="M178 192 L355 192 L355 243 L178 243 Q170 230 170 212 Q170 198 178 192 Z"/>

        {/**/}
        <path className="car-part" data-part="rear-door"
          d="M355 192 L464 192 L464 243 L355 243 Z"/>

        {/**/}
        <path className="car-part" data-part="front-bumper"
          d="M87 241 L260 241 L256 273 Q162 277 91 271 Q82 259 87 241 Z"/>

        {/**/}
        <path className="car-part" data-part="rear-bumper"
          d="M400 243 L598 243 Q599 262 590 271 L400 271 Z"/>

        {/**/}
        <path className="car-part" data-part="rear-taillight"
          d="M570 201 Q587 199 595 211 L597 239 L569 239 Z"/>

        {/**/}
        <path className="car-part" data-part="front-headlight"
          d="M100 222 Q97 203 113 196 L150 192 L158 222 Z"/>

        {/**/}
        <circle className="car-part" data-part="front-wheel" cx="180" cy="278" r="46"/>

        {/**/}
        <circle className="car-part" data-part="rear-wheel" cx="496" cy="278" r="46"/>
      </svg>
    </div>
  </div>

  <div id="part-popup" className="part-popup">
    <div className="popup-header">
      <span id="popup-part-name" className="popup-part-name">—</span>
      <button className="popup-close"  aria-label="Close">✕</button>
    </div>
    <p id="popup-desc" className="popup-desc"></p>
    <div>
      <span className="popup-label">Damage Severity</span>
      <div className="severity-options">
        <button className="sev-btn" data-sev="minor"    >Minor</button>
        <button className="sev-btn" data-sev="moderate" >Moderate</button>
        <button className="sev-btn" data-sev="severe"   >Severe</button>
      </div>
    </div>
    <textarea id="popup-notes" className="popup-notes" placeholder="Add damage notes…"></textarea>
    <button className="popup-save" >Save Note</button>
    <div id="popup-saved" className="popup-saved-indicator">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 6l3 3 5-5" stroke="#C6E83A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Note saved
    </div>
  </div>

  <button className="hero-cta" >
    Scan Damages <img src="scan-59.png" alt="" className="hero-cta-icon" />
  </button>

</section>

</div>{/**/}

{/**/}
<div className="stats-strip">
  <div className="stats-inner">
    <div className="stat">
      <svg className="stat-ico" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2.2"/>
        <path d="M16 9v7l4.5 2.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
      </svg>
      <div className="stat-val">&lt; 60s</div>
      <div className="stat-lbl">Instant Estimates</div>
    </div>
    <div className="stat">
      <svg className="stat-ico" viewBox="0 0 32 32" fill="none">
        <path d="M5 17l7 7L27 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <div className="stat-val">98%</div>
      <div className="stat-lbl">Accuracy Rate</div>
    </div>
    <div className="stat">
      <svg className="stat-ico" viewBox="0 0 32 32" fill="none">
        <path d="M16 3l2.8 6.5L26 11l-5 4.8 1.2 7L16 19.5 9.8 22.8 11 15.8 6 11l7.2-1.5L16 3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      </svg>
      <div className="stat-val">12k+</div>
      <div className="stat-lbl">Claims Processed</div>
    </div>
    <div className="stat">
      <svg className="stat-ico" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="12" r="5" stroke="currentColor" strokeWidth="2.2"/>
        <path d="M5 28c0-6.075 4.925-9 11-9s11 2.925 11 9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
      </svg>
      <div className="stat-val">3-Way</div>
      <div className="stat-lbl">Stakeholder Trust</div>
    </div>
  </div>
</div>

{/**/}
<section className="features">
  <div className="features-grid">
    <div className="feat">
      <div className="feat-circle">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      </div>
      <h3 className="feat-h">For Drivers</h3>
      <p className="feat-p">Upload damage photos, describe the incident, or record audio. Get a verified cost range in seconds — no more wondering if you're being overcharged.</p>
    </div>
    <div className="feat">
      <div className="feat-circle">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/>
        </svg>
      </div>
      <h3 className="feat-h">For Insurers</h3>
      <p className="feat-p">Cross-check claims against AI-verified estimates. Detect padding, spot inconsistencies, and settle disputes faster with neutral, data-backed analysis.</p>
    </div>
    <div className="feat">
      <div className="feat-circle">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
      </div>
      <h3 className="feat-h">For Repair Shops</h3>
      <p className="feat-p">Stop wasting hours arguing with adjusters. Present neutral AI estimates that reference OEM pricing and regional labor rates — trusted by all parties.</p>
    </div>
  </div>
</section>

{/**/}
<section className="showcase">
  <div className="showcase-img">
    <div className="showcase-img-inner">
      {/**/}
      <div className="phone-mock">
        <div className="phone-screen">
          <div className="phone-cam">
            <div className="phone-scan-line"></div>
          </div>
          <div className="phone-results">
            <div className="phone-pill accent"></div>
            <div className="phone-pill w80"></div>
            <div className="phone-pill w60"></div>
            <div className="phone-pill w45"></div>
          </div>
          <div className="phone-estimate">
            <div className="phone-est-label">Verified Range</div>
            <div className="phone-est-val">$1,580–$1,760</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div className="showcase-copy">
    <span className="showcase-tag">How It Works</span>
    <h2 className="showcase-h">Photo in.<br />Estimate out.</h2>
    <p className="showcase-p">Snap a photo of the damage, let our AI identify every affected panel, cross-reference OEM parts pricing, and deliver a plain-English cost range — trusted by drivers, shops, and insurers alike.</p>
    <button onClick={handleOpenModal} className="showcase-link">
      Scan Damages
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
    </button>
  </div>
</section>



{/**/}
<footer className="cta">
  <div className="cta-inner">
    <div className="cta-wordmark">Repair<em>Sync</em></div>
    <div className="cta-right">
      <h3 className="cta-h">Join the Early Access List</h3>
      <p className="cta-p">Be among the first insurers, shops, and drivers to access instant, neutral repair estimates. No commitments — just first in line.</p>
      <div className="email-row">
        <input type="email" className="email-inp" placeholder="your@email.com" />
        <button className="email-sub">Request Access</button>
      </div>
    </div>
  </div>
  <div className="footer-bar">
    <ul className="footer-links">
      <li><a href="#" onClick={(e) => e.preventDefault()}>Privacy</a></li>
      <li><a href="#" onClick={(e) => e.preventDefault()}>Terms</a></li>
      <li><a href="#" onClick={(e) => e.preventDefault()}>Press</a></li>
      <li><a href="#" onClick={(e) => e.preventDefault()}>Careers</a></li>
    </ul>
    <span className="footer-copy">© 2026 RepairSync, Inc. All rights reserved.</span>
  </div>
</footer>

    </>
  );
}
