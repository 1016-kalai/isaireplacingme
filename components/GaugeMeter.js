'use client';
import { useEffect, useState } from 'react';

export default function GaugeMeter({ score }) {
    const [displayScore, setDisplayScore] = useState(0);

    useEffect(() => {
        if (score === null || score === undefined) return;

        const duration = 2000;
        const start = performance.now();

        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayScore(Math.round(score * eased));
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }, [score]);

    // Determine color based on score
    const getScoreColor = () => {
        if (score <= 30) return '#00ff88';
        if (score <= 60) return '#ffaa00';
        if (score <= 80) return '#ff6b35';
        return '#ff3355';
    };

    const getLabel = () => {
        if (score <= 30) return 'LOW RISK';
        if (score <= 60) return 'MODERATE';
        if (score <= 80) return 'HIGH RISK';
        return 'CRITICAL';
    };

    const color = getScoreColor();

    return (
        <div className="score-display">
            <div className="score-ring" style={{ '--score-color': color, '--score-progress': `${(score / 100) * 360}deg` }}>
                <div className="score-ring-inner">
                    <span className="score-number">{displayScore}</span>
                    <span className="score-percent">%</span>
                </div>
            </div>
            <div className="score-label" style={{ color }}>{getLabel()}</div>
            <div className="score-sublabel">AI REPLACEABILITY</div>
        </div>
    );
}
