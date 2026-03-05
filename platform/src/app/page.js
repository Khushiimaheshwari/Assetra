"use client";

import { useEffect, useRef, useState } from "react";

export default function Page() {
  const [counters, setCounters] = useState([0, 0, 0, 0]);
  const statsRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            animateCounters();
          }
        });
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, [hasAnimated]);

  const animateCounters = () => {
    const targets = [12000, 500, 99.9, 24];
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    targets.forEach((target, index) => {
      let current = 0;
      const increment = target / steps;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setCounters((prev) => {
          const newCounters = [...prev];
          newCounters[index] = current;
          return newCounters;
        });
      }, stepDuration);
    });
  };

  return (
    <>
      <style jsx>{`
        /* ── Assetra Color Palette ── */
        :root {
          --primary: #088395;
          --dark-teal: #176B87;
          --sky-blue: #86B6F6;
          --ice-blue: #EBF4F6;
          --ocean-blue: #3674B5;
          --mint: #D1F8EF;
          --white: #ffffff;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        }

        .container {
          width: 100%;
          min-height: 100vh;
          background: var(--ice-blue);
          overflow-x: hidden;
        }

        /* ==================== SCROLL 1: HERO ==================== */
        .heroSection {
          min-height: 100vh;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 7rem 4rem 4rem;
          overflow: hidden;
          background: linear-gradient(135deg, var(--ice-blue) 0%, var(--mint) 60%, #c8f5ec 100%);
        }

        .heroBackground {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          z-index: 0;
          overflow: hidden;
        }

        .floatingShape {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), var(--ocean-blue));
          opacity: 0.07;
          animation: float 20s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33%  { transform: translate(30px, -30px) rotate(120deg); }
          66%  { transform: translate(-20px, 20px) rotate(240deg); }
        }

        /* grid overlay */
        .heroBackground::after {
          content: '';
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(8,131,149,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(8,131,149,0.06) 1px, transparent 1px);
          background-size: 56px 56px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 40%, black 20%, transparent 100%);
        }

        .heroContent {
          max-width: 1300px;
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .heroLeft { animation: fadeInUp 1s ease-out; }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.45rem 1rem;
          background: rgba(255,255,255,0.9);
          border: 2px solid var(--primary);
          border-radius: 50px;
          color: var(--primary);
          font-size: 0.82rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          animation: slideInLeft 0.8s ease-out 0.2s backwards;
        }

        .badge .pulseDot {
          width: 7px; height: 7px;
          background: var(--primary);
          border-radius: 50%;
          animation: pulseDot 2s infinite;
        }

        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%  { opacity: 0.4; transform: scale(0.7); }
        }

        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .heroTitle {
          font-size: 3.6rem;
          font-weight: 800;
          line-height: 1.15;
          color: var(--dark-teal);
          margin-bottom: 1.5rem;
          animation: fadeInUp 0.8s ease-out 0.3s backwards;
          letter-spacing: -0.02em;
        }

        .gradient {
          background: linear-gradient(135deg, var(--primary), var(--ocean-blue));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .heroDescription {
          font-size: 1.15rem;
          line-height: 1.8;
          color: var(--dark-teal);
          opacity: 0.8;
          margin-bottom: 2rem;
          animation: fadeInUp 0.8s ease-out 0.4s backwards;
          font-weight: 300;
        }

        .heroButtons {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          animation: fadeInUp 0.8s ease-out 0.5s backwards;
        }

        .primaryButton {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.9rem 2rem;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 10px 30px rgba(8, 131, 149, 0.3);
        }

        .primaryButton:hover {
          background: var(--ocean-blue);
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(8, 131, 149, 0.4);
        }

        .secondaryButton {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.9rem 2rem;
          background: white;
          color: var(--primary);
          border: 2px solid var(--primary);
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .secondaryButton:hover {
          background: var(--primary);
          color: white;
          transform: translateY(-3px);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* ── Animated Illustration ── */
        .illustrationWrap {
          position: relative;
          width: 100%;
          animation: fadeInRight 1s ease-out 0.4s backwards;
        }

        .illustrationSvg {
          width: 100%;
          height: auto;
          filter: drop-shadow(0 24px 48px rgba(8,131,149,0.18));
        }

        /* SVG internal animations */
        .pulse-ring {
          animation: pulseRing 2.5s ease-in-out infinite;
          transform-origin: center;
        }
        @keyframes pulseRing {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50%       { opacity: 0.35; transform: scale(1.06); }
        }

        .spin-gear {
          animation: spinGear 8s linear infinite;
          transform-origin: 50% 50%;
        }
        @keyframes spinGear { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .spin-gear-rev {
          animation: spinGear 6s linear infinite reverse;
          transform-origin: 50% 50%;
        }

        .float-node {
          animation: floatNode 3s ease-in-out infinite;
        }
        .float-node:nth-child(2) { animation-delay: 0.6s; }
        .float-node:nth-child(3) { animation-delay: 1.2s; }
        .float-node:nth-child(4) { animation-delay: 1.8s; }
        @keyframes floatNode {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }

        .bar-grow {
          animation: barGrow 2s ease-out 0.8s backwards;
          transform-origin: bottom;
        }
        .bar-grow:nth-child(1) { animation-delay: 0.8s; }
        .bar-grow:nth-child(2) { animation-delay: 1.0s; }
        .bar-grow:nth-child(3) { animation-delay: 1.2s; }
        .bar-grow:nth-child(4) { animation-delay: 1.4s; }
        .bar-grow:nth-child(5) { animation-delay: 1.6s; }
        @keyframes barGrow {
          from { transform: scaleY(0); opacity: 0; }
          to   { transform: scaleY(1); opacity: 1; }
        }

        .dash-line {
          stroke-dasharray: 300;
          stroke-dashoffset: 300;
          animation: drawLine 2s ease-out 1s forwards;
        }
        @keyframes drawLine {
          to { stroke-dashoffset: 0; }
        }

        .alert-blink {
          animation: alertBlink 2s ease-in-out infinite 2s;
        }
        @keyframes alertBlink {
          0%, 80%, 100% { opacity: 1; }
          40%            { opacity: 0.3; }
        }

        .orbit-dot {
          animation: orbitDot 4s linear infinite;
          transform-origin: 260px 200px;
        }
        .orbit-dot-2 {
          animation: orbitDot 6s linear infinite reverse;
          transform-origin: 260px 200px;
        }
        @keyframes orbitDot {
          from { transform: rotate(0deg) translateX(90px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(90px) rotate(-360deg); }
        }

        .count-up {
          animation: countUp 0.4s ease-out 2s backwards;
        }
        @keyframes countUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Hero Right: Dashboard ── */
        .heroRight {
          position: relative;
          animation: fadeInRight 1s ease-out 0.4s backwards;
        }

        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(30px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .dashboardPreview { position: relative; }

        .dashboardCard {
          background: white;
          border-radius: 20px;
          padding: 1.8rem;
          box-shadow: 0 24px 64px rgba(8, 131, 149, 0.18);
          border: 1.5px solid var(--mint);
          transition: transform 0.3s ease;
        }

        .dashboardCard:hover { transform: translateY(-6px); }

        .cardHeader {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid var(--ice-blue);
        }

        .trafficLights { display: flex; gap: 0.4rem; }
        .trafficLights span { width: 11px; height: 11px; border-radius: 50%; display: block; }
        .trafficLights span:nth-child(1) { background: #ff5f57; }
        .trafficLights span:nth-child(2) { background: #ffbd2e; }
        .trafficLights span:nth-child(3) { background: #28ca42; }

        .cardTitle { font-weight: 700; color: var(--dark-teal); font-size: 0.9rem; }

        .statsGrid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.8rem;
          margin-bottom: 1.5rem;
        }

        .statBox {
          background: var(--ice-blue);
          padding: 1.1rem;
          border-radius: 10px;
          text-align: center;
          transition: all 0.3s ease;
          border: 1px solid transparent;
        }

        .statBox:hover {
          background: var(--mint);
          transform: scale(1.04);
          border-color: rgba(8,131,149,0.2);
        }

        .statIcon { font-size: 1.6rem; margin-bottom: 0.3rem; }
        .statValue { font-size: 1.3rem; font-weight: 700; color: var(--primary); margin-bottom: 0.15rem; }
        .statLabel { font-size: 0.7rem; color: var(--dark-teal); opacity: 0.7; }

        /* alerts inside dashboard */
        .alertsList { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1.2rem; }

        .alertRow {
          display: flex; align-items: center; gap: 0.6rem;
          padding: 0.5rem 0.7rem;
          background: var(--ice-blue);
          border-radius: 7px;
          font-size: 0.75rem;
        }

        .alertDot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .alertText { color: var(--dark-teal); opacity: 0.85; flex: 1; }
        .alertTag {
          font-size: 0.65rem; padding: 0.15rem 0.5rem;
          border-radius: 4px; font-weight: 600;
        }
        .tagWarn  { background: rgba(255,193,7,0.15); color: #c8960c; }
        .tagOk    { background: rgba(8,131,149,0.12); color: var(--primary); }
        .tagInfo  { background: rgba(54,116,181,0.12); color: var(--ocean-blue); }

        .chartPreview {
          display: flex;
          align-items: flex-end;
          gap: 0.6rem;
          height: 80px;
          padding: 0.8rem;
          background: var(--ice-blue);
          border-radius: 10px;
        }

        .chartBar {
          flex: 1;
          background: linear-gradient(180deg, var(--primary), var(--ocean-blue));
          border-radius: 4px 4px 0 0;
          animation: growUp 1s ease-out;
          opacity: 0.85;
        }

        @keyframes growUp { from { height: 0%; } }

        .floatingCard {
          position: absolute;
          background: white;
          padding: 0.8rem 1.2rem;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(8, 131, 149, 0.2);
          display: flex;
          align-items: center;
          gap: 0.6rem;
          animation: floatCard 3s ease-in-out infinite;
          border: 1px solid rgba(8,131,149,0.1);
        }

        @keyframes floatCard {
          0%, 100% { transform: translateY(0); }
          50%  { transform: translateY(-10px); }
        }

        .miniIcon { font-size: 1.3rem; }
        .miniText { font-size: 0.8rem; font-weight: 600; color: var(--dark-teal); }

        .scrollIndicator {
          position: absolute;
          bottom: 2rem; left: 50%;
          transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
          color: var(--primary); font-size: 0.8rem; font-weight: 600;
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50%  { transform: translateX(-50%) translateY(-10px); }
        }

        .mouse {
          width: 22px; height: 34px;
          border: 2px solid var(--primary);
          border-radius: 11px; position: relative;
        }

        .wheel {
          width: 3px; height: 7px;
          background: var(--primary);
          border-radius: 2px;
          position: absolute; top: 6px; left: 50%;
          transform: translateX(-50%);
          animation: scrollWheel 1.5s infinite;
        }

        @keyframes scrollWheel {
          0%   { top: 6px;  opacity: 1; }
          100% { top: 18px; opacity: 0; }
        }

        /* ==================== TRUST BAR ==================== */
        .trustBar {
          background: white;
          border-top: 1px solid rgba(8,131,149,0.1);
          border-bottom: 1px solid rgba(8,131,149,0.1);
          padding: 1.25rem 4rem;
          display: flex; align-items: center; justify-content: center; gap: 3rem;
          flex-wrap: wrap;
        }

        .trustLabel {
          font-size: 0.78rem; color: #999;
          letter-spacing: 0.1em; text-transform: uppercase; font-weight: 500;
        }

        .trustItem {
          display: flex; align-items: center; gap: 0.45rem;
          color: var(--dark-teal); font-size: 0.82rem; font-weight: 600;
          opacity: 0.75;
          transition: opacity 0.2s;
        }

        .trustItem:hover { opacity: 1; }
        .trustItem svg { color: var(--primary); }

        /* ==================== SCROLL 2: PROBLEMS ==================== */
        .problemSection {
          min-height: 100vh;
          padding: 6rem 4rem;
          background: white;
        }

        .sectionHeader {
          text-align: center;
          max-width: 760px;
          margin: 0 auto 4rem;
        }

        .sectionBadge {
          display: inline-block;
          padding: 0.4rem 1rem;
          background: var(--ice-blue);
          color: var(--primary);
          border-radius: 50px;
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 1rem;
          border: 1px solid rgba(8,131,149,0.2);
        }

        .sectionTitle {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--dark-teal);
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
        }

        .sectionSubtitle {
          font-size: 1.05rem;
          color: var(--dark-teal);
          opacity: 0.65;
          line-height: 1.7;
          font-weight: 300;
        }

        .problemsGrid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5px;
          border: 1.5px solid rgba(8,131,149,0.12);
          border-radius: 18px;
          overflow: hidden;
        }

        .problemCard {
          background: var(--ice-blue);
          padding: 2rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .problemCard::before {
          content: attr(data-num);
          position: absolute; top: -8px; right: 1.2rem;
          font-size: 5rem; font-weight: 800;
          color: rgba(8,131,149,0.05);
          line-height: 1;
          pointer-events: none;
          transition: color 0.3s;
        }

        .problemCard:hover {
          background: var(--mint);
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(8, 131, 149, 0.12);
          z-index: 1;
        }

        .problemCard:hover::before { color: rgba(8,131,149,0.1); }

        .problemIcon {
          width: 56px; height: 56px;
          display: flex; align-items: center; justify-content: center;
          background: white;
          border-radius: 12px;
          color: var(--primary);
          margin-bottom: 1.25rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(8,131,149,0.1);
        }

        .problemCard:hover .problemIcon {
          transform: scale(1.1) rotate(5deg);
          background: var(--primary);
          color: white;
        }

        .problemCard h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--dark-teal);
          margin-bottom: 0.75rem;
          line-height: 1.3;
        }

        .problemCard p {
          color: var(--dark-teal);
          opacity: 0.75;
          line-height: 1.65;
          font-size: 0.9rem;
          font-weight: 300;
        }

        /* ==================== SCROLL 3: SOLUTIONS ==================== */
        .solutionsSection {
          min-height: 100vh;
          padding: 6rem 4rem;
          background: linear-gradient(160deg, var(--dark-teal) 0%, var(--primary) 50%, #0a9bab 100%);
          position: relative;
          overflow: hidden;
        }

        .solutionsSection::before {
          content: '';
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          opacity: 0.4;
        }

        .solutionsSection .sectionHeader { position: relative; z-index: 1; }
        .solutionsSection .sectionBadge { background: rgba(255,255,255,0.18); color: white; border-color: rgba(255,255,255,0.3); }
        .solutionsSection .sectionTitle  { color: white; }
        .solutionsSection .sectionSubtitle { color: rgba(255,255,255,0.85); opacity: 1; }

        .solutionsContainer {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          position: relative; z-index: 1;
        }

        .solutionCard {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(12px);
          border: 1.5px solid rgba(255,255,255,0.18);
          border-radius: 18px;
          padding: 2rem;
          display: flex;
          gap: 1.5rem;
          transition: all 0.4s ease;
          animation: fadeInUp 0.8s ease-out;
          animation-fill-mode: backwards;
        }

        .solutionCard:nth-child(1) { animation-delay: 0.1s; }
        .solutionCard:nth-child(2) { animation-delay: 0.2s; }
        .solutionCard:nth-child(3) { animation-delay: 0.3s; }
        .solutionCard:nth-child(4) { animation-delay: 0.4s; }
        .solutionCard:nth-child(5) { animation-delay: 0.5s; }
        .solutionCard:nth-child(6) { animation-delay: 0.6s; }

        .solutionCard:hover {
          background: rgba(255,255,255,0.16);
          border-color: rgba(209,248,239,0.5);
          transform: translateY(-6px);
          box-shadow: 0 20px 48px rgba(0,0,0,0.25);
        }

        .solutionNumber {
          font-size: 2.2rem;
          font-weight: 800;
          color: rgba(255,255,255,0.2);
          font-variant-numeric: tabular-nums;
          flex-shrink: 0;
          line-height: 1;
          padding-top: 0.1rem;
        }

        .solutionContent { flex: 1; }

        .solutionIcon {
          width: 52px; height: 52px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.18);
          border-radius: 12px;
          color: white;
          margin-bottom: 1rem;
          transition: all 0.3s ease;
        }

        .solutionCard:hover .solutionIcon {
          background: var(--mint);
          color: var(--primary);
        }

        .solutionContent h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.6rem;
          line-height: 1.3;
        }

        .solutionContent p {
          color: rgba(255,255,255,0.82);
          line-height: 1.7;
          margin-bottom: 1rem;
          font-size: 0.88rem;
          font-weight: 300;
        }

        .featureList {
          list-style: none; padding: 0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }

        .featureList li {
          color: rgba(255,255,255,0.75);
          font-size: 0.8rem;
          padding-left: 1.2rem;
          position: relative;
        }

        .featureList li::before {
          content: '✓';
          position: absolute; left: 0;
          color: var(--mint);
          font-weight: bold;
        }

        /* ==================== SCROLL 4: STATS + CTA ==================== */
        .ctaSection {
          min-height: 100vh;
          background: white;
          position: relative;
        }

        .statsSection {
          padding: 5rem 4rem 4rem;
          background: var(--ice-blue);
        }

        .statsContainer {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .statCard {
          text-align: center;
          padding: 2rem 1.5rem;
          background: white;
          border-radius: 16px;
          box-shadow: 0 8px 28px rgba(8, 131, 149, 0.1);
          transition: all 0.3s ease;
          animation: fadeInUp 0.8s ease-out;
          animation-fill-mode: backwards;
          border: 1px solid rgba(8,131,149,0.08);
        }

        .statCard:nth-child(1) { animation-delay: 0.1s; }
        .statCard:nth-child(2) { animation-delay: 0.2s; }
        .statCard:nth-child(3) { animation-delay: 0.3s; }
        .statCard:nth-child(4) { animation-delay: 0.4s; }

        .statCard:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 48px rgba(8, 131, 149, 0.18);
          border-color: rgba(8,131,149,0.2);
        }

        .statNumber {
          font-size: 2.8rem;
          font-weight: 800;
          background: linear-gradient(135deg, var(--primary), var(--ocean-blue));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.4rem;
          line-height: 1.1;
        }

        .statText {
          font-size: 0.9rem;
          color: var(--dark-teal);
          opacity: 0.75;
          font-weight: 600;
        }

        .ctaContent { padding: 5rem 4rem; }

        .ctaBox {
          max-width: 780px;
          margin: 0 auto;
          padding: 4rem;
          background: linear-gradient(135deg, var(--ice-blue), var(--mint));
          border-radius: 28px;
          box-shadow: 0 20px 60px rgba(8, 131, 149, 0.14);
          text-align: center;
          animation: fadeInUp 0.8s ease-out;
          border: 1.5px solid rgba(8,131,149,0.12);
        }

        .ctaTitle {
          font-size: 2.4rem;
          font-weight: 800;
          color: var(--dark-teal);
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
        }

        .ctaDescription {
          font-size: 1.05rem;
          color: var(--dark-teal);
          opacity: 0.75;
          line-height: 1.8;
          margin-bottom: 2rem;
          font-weight: 300;
        }

        .ctaButtons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 2rem;
        }

        .ctaPrimary {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 1rem 2.2rem;
          background: var(--primary);
          color: white; border: none; border-radius: 12px;
          font-size: 1rem; font-weight: 600;
          cursor: pointer; transition: all 0.3s ease;
          box-shadow: 0 10px 30px rgba(8, 131, 149, 0.3);
        }

        .ctaPrimary:hover {
          background: var(--ocean-blue);
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(8, 131, 149, 0.4);
        }

        .ctaSecondary {
          padding: 1rem 2.2rem;
          background: white;
          color: var(--primary);
          border: 2px solid var(--primary);
          border-radius: 12px;
          font-size: 1rem; font-weight: 600;
          cursor: pointer; transition: all 0.3s ease;
        }

        .ctaSecondary:hover {
          background: var(--primary);
          color: white;
          transform: translateY(-3px);
        }

        .trustBadges {
          display: flex; justify-content: center;
          gap: 2rem; flex-wrap: wrap;
        }

        .trustBadge {
          display: flex; align-items: center; gap: 0.45rem;
          color: var(--dark-teal);
          font-size: 0.82rem; font-weight: 600;
          opacity: 0.8;
        }

        .trustBadge svg { color: var(--primary); }

        /* ==================== FOOTER ==================== */
        .footer {
          background: var(--dark-teal);
          padding: 3.5rem 4rem 1.5rem;
          color: white;
        }

        .footerContent {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 4rem;
          margin-bottom: 3rem;
        }

        .footerLeft { max-width: 380px; }

        .footerLogo {
          display: flex; align-items: center; gap: 0.7rem;
          font-size: 1.4rem; font-weight: 800;
          margin-bottom: 1rem;
          letter-spacing: 0.04em;
        }

        .footerDesc {
          color: rgba(255,255,255,0.7);
          line-height: 1.65;
          font-size: 0.88rem;
          font-weight: 300;
        }

        .footerLinks {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .footerColumn h4 {
          font-size: 0.85rem; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase;
          margin-bottom: 1.2rem;
          opacity: 0.9;
        }

        .footerColumn a {
          display: block;
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          margin-bottom: 0.7rem;
          font-size: 0.88rem;
          transition: color 0.25s;
          font-weight: 300;
        }

        .footerColumn a:hover { color: white; }

        .footerBottom {
          max-width: 1200px;
          margin: 0 auto;
          padding-top: 2rem;
          border-top: 1px solid rgba(255,255,255,0.12);
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.82rem;
          color: rgba(255,255,255,0.55);
        }

        .footerBottomLinks { display: flex; gap: 2rem; }
        .footerBottomLinks a {
          color: rgba(255,255,255,0.55);
          text-decoration: none;
          transition: color 0.25s;
        }
        .footerBottomLinks a:hover { color: white; }

        /* ==================== RESPONSIVE ==================== */
        @media (max-width: 1024px) {
          .navbar { padding: 1.25rem 2rem; }
          .navbar .navLinks { display: none; }
          .heroSection { padding: 6rem 2rem 4rem; }
          .heroContent { grid-template-columns: 1fr; gap: 3rem; }
          .heroTitle { font-size: 2.6rem; }
          .trustBar { padding: 1.25rem 2rem; gap: 1.5rem; }
          .problemSection { padding: 5rem 2rem; }
          .problemsGrid { grid-template-columns: repeat(2, 1fr); }
          .solutionsSection { padding: 5rem 2rem; }
          .solutionsContainer { grid-template-columns: 1fr; }
          .statsSection { padding: 4rem 2rem; }
          .statsContainer { grid-template-columns: repeat(2, 1fr); }
          .ctaContent { padding: 4rem 2rem; }
          .footer { padding: 3rem 2rem 1.5rem; }
          .footerContent { grid-template-columns: 1fr; gap: 2rem; }
          .footerLinks { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 768px) {
          .heroTitle { font-size: 2rem; }
          .heroDescription { font-size: 1rem; }
          .heroButtons { flex-direction: column; }
          .sectionTitle { font-size: 2rem; }
          .problemsGrid { grid-template-columns: 1fr; }
          .statsContainer { grid-template-columns: 1fr; }
          .ctaButtons { flex-direction: column; }
          .ctaBox { padding: 2rem; }
          .ctaTitle { font-size: 1.8rem; }
          .footerBottom { flex-direction: column; gap: 1rem; text-align: center; }
          .footerLinks { grid-template-columns: 1fr; }
          .floatingCard { display: none; }
        }
      `}</style>

      <div className="container">

        {/* ── SCROLL 1: HERO ── */}
        <section className="heroSection">
          <div className="heroBackground">
            <div className="floatingShape" style={{ width: 320, height: 320, top: '8%', left: '3%' }}></div>
            <div className="floatingShape" style={{ width: 260, height: 260, top: '55%', right: '8%' }}></div>
            <div className="floatingShape" style={{ width: 180, height: 180, bottom: '12%', left: '18%' }}></div>
          </div>

          <div className="heroContent">
            {/* Left */}
            <div className="heroLeft">
              <div className="badge">
                <span className="pulseDot"></span>
                AI-Powered Asset Management
              </div>

              <h1 className="heroTitle">
                Smart Asset
                <span style={{
                  background: 'linear-gradient(135deg, #088395, #3674B5)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}> Intelligence </span>
                for Institutions
              </h1>

              <p className="heroDescription">
                Centralized, audit-ready platform for managing all institutional assets.
                Track AMC, maintenance, depreciation, and compliance — all powered by AI.
              </p>

              <div className="heroButtons">
                <button className="primaryButton">
                  Get Started
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Right: Animated Illustration */}
            <div className="heroRight">
              <div className="illustrationWrap">
                <svg className="illustrationSvg" viewBox="0 0 520 420" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#EBF4F6"/>
                      <stop offset="100%" stopColor="#D1F8EF"/>
                    </linearGradient>
                    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff"/>
                      <stop offset="100%" stopColor="#f0fbff"/>
                    </linearGradient>
                    <linearGradient id="barGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#088395"/>
                      <stop offset="100%" stopColor="#3674B5"/>
                    </linearGradient>
                    <linearGradient id="tealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#088395"/>
                      <stop offset="100%" stopColor="#176B87"/>
                    </linearGradient>
                    <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
                      <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#088395" floodOpacity="0.15"/>
                    </filter>
                    <filter id="softShadow">
                      <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#176B87" floodOpacity="0.1"/>
                    </filter>
                  </defs>

                  {/* ── Background card ── */}
                  <rect x="30" y="30" width="460" height="360" rx="24" fill="url(#bgGrad)" opacity="0.6"/>

                  {/* ── Central hexagon emblem ── */}
                  <g className="pulse-ring">
                    <circle cx="260" cy="185" r="88" fill="none" stroke="#088395" strokeWidth="1.5" opacity="0.2"/>
                    <circle cx="260" cy="185" r="72" fill="none" stroke="#088395" strokeWidth="1" opacity="0.15"/>
                  </g>
                  <polygon points="260,110 318,143 318,210 260,243 202,210 202,143" fill="url(#tealGrad)" filter="url(#shadow)" opacity="0.92"/>
                  <polygon points="260,120 308,147 308,202 260,229 212,202 212,147" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"/>
                  {/* icon inside hex */}
                  <g fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="243" y="163" width="34" height="28" rx="3"/>
                    <path d="M251 163v-5a9 9 0 0118 0v5"/>
                    <path d="M260 176v6M256 181h8"/>
                  </g>

                  {/* ── Orbit dots ── */}
                  <g className="orbit-dot">
                    <circle cx="260" cy="185" r="7" fill="#088395"/>
                    <circle cx="260" cy="185" r="4" fill="white"/>
                  </g>
                  <g className="orbit-dot-2">
                    <circle cx="260" cy="185" r="5" fill="#3674B5"/>
                    <circle cx="260" cy="185" r="2.5" fill="white"/>
                  </g>

                  {/* ── Connection lines ── */}
                  <line x1="205" y1="160" x2="130" y2="100" stroke="#088395" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4"/>
                  <line x1="205" y1="210" x2="120" y2="280" stroke="#088395" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4"/>
                  <line x1="315" y1="160" x2="400" y2="100" stroke="#3674B5" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4"/>
                  <line x1="315" y1="210" x2="390" y2="290" stroke="#3674B5" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4"/>
                  <line x1="260" y1="243" x2="260" y2="320" stroke="#088395" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4"/>

                  {/* ── Floating node cards ── */}

                  {/* Node 1: AMC Tracker (top-left) */}
                  <g className="float-node" filter="url(#softShadow)">
                    <rect x="50" y="62" width="140" height="72" rx="14" fill="white"/>
                    <rect x="50" y="62" width="140" height="72" rx="14" fill="none" stroke="rgba(8,131,149,0.18)" strokeWidth="1"/>
                    <rect x="62" y="74" width="28" height="28" rx="7" fill="rgba(8,131,149,0.1)"/>
                    <path d="M76 82v8h6" stroke="#088395" strokeWidth="2" strokeLinecap="round" fill="none"/>
                    <circle cx="76" cy="88" r="8" fill="none" stroke="#088395" strokeWidth="1.5" opacity="0.5"/>
                    <text x="98" y="86" fontFamily="system-ui,sans-serif" fontSize="10" fontWeight="700" fill="#176B87">AMC Tracker</text>
                    <text x="98" y="100" fontFamily="system-ui,sans-serif" fontSize="9" fill="#088395" opacity="0.7">47 due this month</text>
                    <rect x="62" y="108" width="116" height="4" rx="2" fill="#EBF4F6"/>
                    <rect x="62" y="108" width="80" height="4" rx="2" fill="#088395" opacity="0.6"/>
                    <circle cx="174" cy="74" r="5" fill="#f59e0b" className="alert-blink"/>
                  </g>

                  {/* Node 2: Depreciation (top-right) */}
                  <g className="float-node" filter="url(#softShadow)">
                    <rect x="328" y="62" width="140" height="72" rx="14" fill="white"/>
                    <rect x="328" y="62" width="140" height="72" rx="14" fill="none" stroke="rgba(54,116,181,0.18)" strokeWidth="1"/>
                    <rect x="340" y="74" width="28" height="28" rx="7" fill="rgba(54,116,181,0.1)"/>
                    <path d="M354 93l-4-4 4-4M358 89h-8" stroke="#3674B5" strokeWidth="2" strokeLinecap="round" fill="none"/>
                    <text x="376" y="86" fontFamily="system-ui,sans-serif" fontSize="10" fontWeight="700" fill="#176B87">Depreciation</text>
                    <text x="376" y="100" fontFamily="system-ui,sans-serif" fontSize="9" fill="#3674B5" opacity="0.7">₹2.4Cr asset value</text>
                    {/* mini bar chart */}
                    <rect x="340" y="106" width="8" height="10" rx="1" fill="#3674B5" opacity="0.4" className="bar-grow"/>
                    <rect x="351" y="100" width="8" height="16" rx="1" fill="#3674B5" opacity="0.6" className="bar-grow"/>
                    <rect x="362" y="103" width="8" height="13" rx="1" fill="#3674B5" opacity="0.5" className="bar-grow"/>
                    <rect x="373" y="96" width="8" height="20" rx="1" fill="#3674B5" opacity="0.8" className="bar-grow"/>
                    <rect x="384" y="99" width="8" height="17" rx="1" fill="#3674B5" opacity="0.6" className="bar-grow"/>
                  </g>

                  {/* Node 3: Audit Ready (bottom-left) */}
                  <g className="float-node" filter="url(#softShadow)">
                    <rect x="42" y="252" width="140" height="72" rx="14" fill="white"/>
                    <rect x="42" y="252" width="140" height="72" rx="14" fill="none" stroke="rgba(8,131,149,0.18)" strokeWidth="1"/>
                    <rect x="54" y="264" width="28" height="28" rx="7" fill="rgba(8,131,149,0.1)"/>
                    <path d="M61 278h14M61 283h10" stroke="#088395" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M69 272l3 3-5 5" stroke="#28ca41" strokeWidth="2" strokeLinecap="round" fill="none"/>
                    <text x="90" y="276" fontFamily="system-ui,sans-serif" fontSize="10" fontWeight="700" fill="#176B87">Audit Ready</text>
                    <text x="90" y="290" fontFamily="system-ui,sans-serif" fontSize="9" fill="#088395" opacity="0.7">NAAC · NBA · Internal</text>
                    <rect x="54" y="298" width="116" height="5" rx="2.5" fill="#EBF4F6"/>
                    <rect x="54" y="298" width="104" height="5" rx="2.5" fill="#28ca41" opacity="0.5"/>
                    <text x="54" y="314" fontFamily="system-ui,sans-serif" fontSize="8" fill="#176B87" opacity="0.6">Compliance: 98%</text>
                  </g>

                  {/* Node 4: AI Insights (bottom-right) */}
                  <g className="float-node" filter="url(#softShadow)">
                    <rect x="334" y="258" width="140" height="72" rx="14" fill="white"/>
                    <rect x="334" y="258" width="140" height="72" rx="14" fill="none" stroke="rgba(54,116,181,0.18)" strokeWidth="1"/>
                    <rect x="346" y="270" width="28" height="28" rx="7" fill="rgba(54,116,181,0.1)"/>
                    <circle cx="360" cy="284" r="7" fill="none" stroke="#3674B5" strokeWidth="1.5"/>
                    <circle cx="360" cy="284" r="3" fill="#3674B5"/>
                    <circle cx="353" cy="278" r="2" fill="#088395" opacity="0.6"/>
                    <circle cx="367" cy="278" r="2" fill="#088395" opacity="0.6"/>
                    <text x="382" y="282" fontFamily="system-ui,sans-serif" fontSize="10" fontWeight="700" fill="#176B87">AI Insights</text>
                    <text x="382" y="296" fontFamily="system-ui,sans-serif" fontSize="9" fill="#3674B5" opacity="0.7">Predictive alerts on</text>
                    <text x="346" y="314" fontFamily="system-ui,sans-serif" fontSize="8.5" fill="#3674B5" opacity="0.7">3 assets need attention →</text>
                  </g>

                  {/* Node 5: bottom center — Inventory */}
                  <g className="float-node" filter="url(#softShadow)">
                    <rect x="193" y="326" width="134" height="54" rx="12" fill="white"/>
                    <rect x="193" y="326" width="134" height="54" rx="12" fill="none" stroke="rgba(8,131,149,0.15)" strokeWidth="1"/>
                    <rect x="205" y="338" width="22" height="22" rx="6" fill="rgba(8,131,149,0.1)"/>
                    <path d="M211 352l3 3 5-6" stroke="#088395" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
                    <text x="234" y="348" fontFamily="system-ui,sans-serif" fontSize="9.5" fontWeight="700" fill="#176B87">12,840 Assets</text>
                    <text x="234" y="362" fontFamily="system-ui,sans-serif" fontSize="8.5" fill="#088395" opacity="0.7">Live inventory sync</text>
                  </g>

                  {/* ── Gears (decorative) ── */}
                  <g className="spin-gear" style={{transformOrigin: '470px 370px'}}>
                    <circle cx="470" cy="370" r="18" fill="none" stroke="#088395" strokeWidth="2" opacity="0.12"/>
                    <circle cx="470" cy="370" r="11" fill="none" stroke="#088395" strokeWidth="2" opacity="0.12"/>
                    {[0,45,90,135,180,225,270,315].map((angle, i) => (
                      <rect key={i}
                        x="467" y="349"
                        width="6" height="6"
                        rx="1"
                        fill="#088395" opacity="0.12"
                        transform={`rotate(${angle} 470 370)`}
                      />
                    ))}
                  </g>
                  <g className="spin-gear-rev" style={{transformOrigin: '56px 370px'}}>
                    <circle cx="56" cy="370" r="14" fill="none" stroke="#3674B5" strokeWidth="1.5" opacity="0.12"/>
                    <circle cx="56" cy="370" r="8" fill="none" stroke="#3674B5" strokeWidth="1.5" opacity="0.12"/>
                    {[0,60,120,180,240,300].map((angle, i) => (
                      <rect key={i}
                        x="53" y="354"
                        width="6" height="5"
                        rx="1"
                        fill="#3674B5" opacity="0.12"
                        transform={`rotate(${angle} 56 370)`}
                      />
                    ))}
                  </g>

                </svg>
              </div>
            </div>
          </div>

          <div className="scrollIndicator">
            <div className="mouse"><div className="wheel"></div></div>
            <span>Scroll to explore</span>
          </div>
        </section>

        {/* Trust Bar */}
        <div className="trustBar">
          <span className="trustLabel">Trusted Standard</span>
          <div className="trustItem">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            NAAC Compliant
          </div>
          <div className="trustItem">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            NBA Ready
          </div>
          <div className="trustItem">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            ISO 27001
          </div>
          <div className="trustItem">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 100 20 10 10 0 000-20z"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
            AI-Powered
          </div>
          <div className="trustItem">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            24/7 Uptime
          </div>
        </div>

        {/* ── SCROLL 2: PROBLEMS ── */}
        <section className="problemSection" id="problems">
          <div className="sectionHeader">
            <span className="sectionBadge">The Challenge</span>
            <h2 className="sectionTitle">Problems Institutions Face</h2>
            <p className="sectionSubtitle">
              Manual asset management costs institutions time, money, and compliance scores every year.
            </p>
          </div>

          <div className="problemsGrid">
            <div className="problemCard" data-num="01">
              <div className="problemIcon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <h3>Missed AMC & Warranty Expiries</h3>
              <p>No automated reminders mean contracts lapse silently, leaving critical equipment unprotected and prone to costly failures.</p>
            </div>

            <div className="problemCard" data-num="02">
              <div className="problemIcon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11l3 3L22 4"/>
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                </svg>
              </div>
              <h3>Inaccurate Depreciation Records</h3>
              <p>Manual spreadsheet calculations produce errors that distort balance sheets and create serious risks during statutory audits.</p>
            </div>

            <div className="problemCard" data-num="03">
              <div className="problemIcon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <path d="M20 8v6M23 11h-6"/>
                </svg>
              </div>
              <h3>Poor Accountability & Traceability</h3>
              <p>No digital trail for equipment responsibilities, movements, or usage patterns — accountability breaks down institution-wide.</p>
            </div>

            <div className="problemCard" data-num="04">
              <div className="problemIcon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                  <path d="M9 22V12h6v10"/>
                </svg>
              </div>
              <h3>NAAC / NBA Audit Difficulties</h3>
              <p>Scattered paper records across departments make preparing inspection reports a weeks-long, error-prone nightmare.</p>
            </div>

            <div className="problemCard" data-num="05">
              <div className="problemIcon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                  <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/>
                </svg>
              </div>
              <h3>No Usage Analytics</h3>
              <p>Without utilization insights, institutions keep purchasing equipment that already sits idle in another department.</p>
            </div>

            <div className="problemCard" data-num="06">
              <div className="problemIcon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <h3>Unplanned Equipment Breakdowns</h3>
              <p>Reactive maintenance leads to mid-semester downtime, disrupted lab schedules, and ballooning repair costs.</p>
            </div>
          </div>
        </section>

        {/* ── SCROLL 3: SOLUTIONS ── */}
        <section className="solutionsSection" id="solutions">
          <div className="sectionHeader">
            <span className="sectionBadge">Our Solution</span>
            <h2 className="sectionTitle">6 Powerful Modules. One Platform.</h2>
            <p className="sectionSubtitle">
              Everything your institution needs to go from reactive chaos to proactive asset intelligence.
            </p>
          </div>

          <div className="solutionsContainer">
            <div className="solutionCard">
              <div className="solutionNumber">01</div>
              <div className="solutionContent">
                <div className="solutionIcon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                  </svg>
                </div>
                <h3>Asset Registration & Inventory</h3>
                <p>Centralized registration of all institutional assets with complete specifications, purchase data, cost center mapping, and location tracking.</p>
                <ul className="featureList">
                  <li>Unique asset ID generation</li>
                  <li>Barcode / QR integration</li>
                  <li>Department-wise classification</li>
                  <li>Vendor details management</li>
                </ul>
              </div>
            </div>

            <div className="solutionCard">
              <div className="solutionNumber">02</div>
              <div className="solutionContent">
                <div className="solutionIcon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                    <circle cx="8.5" cy="7" r="4"/>
                    <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                  </svg>
                </div>
                <h3>Asset Issuing & Return Management</h3>
                <p>Digital logs for asset issuance and return across departments and staff — complete accountability without paper registers.</p>
                <ul className="featureList">
                  <li>Issue / return tracking</li>
                  <li>Digital signatures</li>
                  <li>Automated notifications</li>
                  <li>Full usage history</li>
                </ul>
              </div>
            </div>

            <div className="solutionCard">
              <div className="solutionNumber">03</div>
              <div className="solutionContent">
                <div className="solutionIcon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
                  </svg>
                </div>
                <h3>Maintenance & AMC Management</h3>
                <p>Automated AMC and warranty alerts, preventive maintenance scheduling, service history, and complaint resolution workflows.</p>
                <ul className="featureList">
                  <li>Automated AMC alerts</li>
                  <li>Maintenance scheduling</li>
                  <li>Service history tracking</li>
                  <li>Complaint management</li>
                </ul>
              </div>
            </div>

            <div className="solutionCard">
              <div className="solutionNumber">04</div>
              <div className="solutionContent">
                <div className="solutionIcon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                  </svg>
                </div>
                <h3>Depreciation & Asset Valuation</h3>
                <p>Automated depreciation calculations using multiple methods, real-time valuation history, and financial audit-ready reports.</p>
                <ul className="featureList">
                  <li>SLM &amp; WDV methods</li>
                  <li>Automated calculations</li>
                  <li>Valuation reports</li>
                  <li>Full audit trail</li>
                </ul>
              </div>
            </div>

            <div className="solutionCard">
              <div className="solutionNumber">05</div>
              <div className="solutionContent">
                <div className="solutionIcon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                  </svg>
                </div>
                <h3>Reports & Compliance Management</h3>
                <p>One-click NAAC and NBA reports, custom report builder, department-wise analytics, and scheduled delivery to stakeholders.</p>
                <ul className="featureList">
                  <li>NAAC / NBA ready</li>
                  <li>Custom report builder</li>
                  <li>Export PDF / Excel</li>
                  <li>Scheduled reports</li>
                </ul>
              </div>
            </div>

            <div className="solutionCard">
              <div className="solutionNumber">06</div>
              <div className="solutionContent">
                <div className="solutionIcon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20z"/>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                    <path d="M12 17h.01"/>
                  </svg>
                </div>
                <h3>AI-Based Asset Intelligence</h3>
                <p>Predictive maintenance, anomaly detection, asset health scoring, and utilization optimization powered by machine learning.</p>
                <ul className="featureList">
                  <li>Predictive maintenance</li>
                  <li>Anomaly detection</li>
                  <li>Asset health scoring</li>
                  <li>Optimization insights</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── SCROLL 4: STATS + CTA ── */}
        <section className="ctaSection">
          <div className="statsSection" ref={statsRef} id="stats">
            <div className="statsContainer">
              <div className="statCard">
                <div className="statNumber">
                  {counters[0] >= 12000 ? '12,000+' : Math.floor(counters[0]).toLocaleString()}
                </div>
                <div className="statText">Assets Managed</div>
              </div>
              <div className="statCard">
                <div className="statNumber">
                  {counters[1] >= 500 ? '500+' : Math.floor(counters[1])}
                </div>
                <div className="statText">Institutions Served</div>
              </div>
              <div className="statCard">
                <div className="statNumber">
                  {counters[2].toFixed(1)}%
                </div>
                <div className="statText">Accuracy Rate</div>
              </div>
              <div className="statCard">
                <div className="statNumber">24/7</div>
                <div className="statText">AI Monitoring</div>
              </div>
            </div>
          </div>

          <div className="ctaContent" id="contact">
            <div className="ctaBox">
              <h2 className="ctaTitle">Ready to Transform Your Asset Management?</h2>
              <p className="ctaDescription">
                Join leading educational institutions modernizing their operations with Assetra.
                Experience intelligent, audit-ready asset management from day one.
              </p>

              <div className="ctaButtons">
                <button className="ctaPrimary">
                  Start Free Trial
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
                <button className="ctaSecondary">Schedule Demo</button>
              </div>

              <div className="trustBadges">
                <div className="trustBadge">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                  <span>NAAC Compliant</span>
                </div>
                <div className="trustBadge">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  <span>Secure & Encrypted</span>
                </div>
                <div className="trustBadge">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20z"/>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                    <path d="M12 17h.01"/>
                  </svg>
                  <span>AI-Powered</span>
                </div>
                <div className="trustBadge">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 11l3 3L22 4"/>
                  </svg>
                  <span>No Credit Card Required</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="footer">
            <div className="footerContent">
              <div className="footerLeft">
                <div className="footerLogo">
                  <svg width="28" height="28" viewBox="0 0 36 40" fill="none">
                    <path d="M18 2L33 11V29L18 38L3 29V11L18 2Z" stroke="white" strokeWidth="2"/>
                    <path d="M18 13L18 22M13 18L18 22L23 18" stroke="rgba(209,248,239,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  ASSETRA
                </div>
                <p className="footerDesc">
                  Smart Inventory & Maintenance Tracking System for Educational Institutions.
                  Built for NAAC, NBA, and audit-ready compliance.
                </p>
              </div>

              <div className="footerLinks">
                <div className="footerColumn">
                  <h4>Product</h4>
                  <a href="#features">Features</a>
                  <a href="#solutions">Modules</a>
                  <a href="#pricing">Pricing</a>
                  <a href="#changelog">Changelog</a>
                </div>
                <div className="footerColumn">
                  <h4>Company</h4>
                  <a href="#about">About Us</a>
                  <a href="#contact">Contact</a>
                  <a href="#careers">Careers</a>
                  <a href="#blog">Blog</a>
                </div>
                <div className="footerColumn">
                  <h4>Resources</h4>
                  <a href="#docs">Documentation</a>
                  <a href="#api">API Reference</a>
                  <a href="#support">Support</a>
                  <a href="#status">System Status</a>
                </div>
              </div>
            </div>

            <div className="footerBottom">
              <p>© 2025 Assetra. All rights reserved.</p>
              <div className="footerBottomLinks">
                <a href="#privacy">Privacy Policy</a>
                <a href="#terms">Terms of Service</a>
                <a href="#security">Security</a>
              </div>
            </div>
          </footer>
        </section>

      </div>
    </>
  );
}