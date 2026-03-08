'use client';
import { useEffect, useRef, useState } from 'react';
import { LOADING_MESSAGES } from '@/lib/data';

export default function LoadingScreen({ onComplete }) {
    const [msgIndex, setMsgIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const shuffled = useRef([]);

    useEffect(() => {
        shuffled.current = [...LOADING_MESSAGES].sort(() => Math.random() - 0.5);
        const totalDuration = 4500;
        const stepDuration = totalDuration / shuffled.current.length;

        // Progress bar
        const progressInterval = setInterval(() => {
            setProgress(p => { const next = p + 1.2; return next > 100 ? 100 : next; });
        }, totalDuration / 100);

        // Messages
        let idx = 0;
        const msgInterval = setInterval(() => {
            idx++;
            if (idx < shuffled.current.length) setMsgIndex(idx);
        }, stepDuration);

        // Complete
        const timeout = setTimeout(() => {
            clearInterval(progressInterval);
            clearInterval(msgInterval);
            setProgress(100);
            onComplete();
        }, totalDuration);

        return () => { clearInterval(progressInterval); clearInterval(msgInterval); clearTimeout(timeout); };
    }, [onComplete]);

    const msg = shuffled.current[msgIndex] || LOADING_MESSAGES[0];

    return (
        <section className="screen active" id="loading-section">
            <div className="loading-container">
                <div className="coffin-loader"><div className="coffin"><div className="coffin-lid" /><div className="coffin-body" /><div className="coffin-cross">✝</div></div></div>
                <h2 className="loading-title">{msg.text}</h2>
                <div className="loading-bar"><div className="loading-progress" style={{ width: `${progress}%` }} /></div>
                <p className="loading-subtitle">{msg.sub}</p>
            </div>
        </section>
    );
}
