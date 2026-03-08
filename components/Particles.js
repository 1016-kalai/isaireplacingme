'use client';
import { useEffect, useRef } from 'react';

export default function Particles() {
    const containerRef = useRef(null);
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const count = window.innerWidth < 640 ? 20 : 40;
        const colors = ["rgba(139,92,246,0.3)", "rgba(255,51,85,0.2)", "rgba(0,255,136,0.2)", "rgba(255,170,0,0.15)"];
        for (let i = 0; i < count; i++) {
            const p = document.createElement("div");
            p.className = "particle";
            const size = Math.random() * 4 + 1;
            p.style.cssText = `width:${size}px;height:${size}px;left:${Math.random() * 100}%;background:${colors[Math.floor(Math.random() * colors.length)]};animation-duration:${Math.random() * 20 + 15}s;animation-delay:${Math.random() * 15}s;`;
            container.appendChild(p);
        }
        return () => { container.innerHTML = ''; };
    }, []);
    return <div id="particles-container" ref={containerRef} />;
}
