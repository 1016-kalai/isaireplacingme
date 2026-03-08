'use client';
import { useEffect, useRef, useState, useCallback } from 'react';

export default function ResultScreen({ formData, score, orgIntel, countdown, badge, roast, onReset }) {

    const [cdVals, setCdVals] = useState({ years: 0, months: 0, days: 0 });
    const cardRef = useRef(null);

    // Animate countdown
    useEffect(() => {
        if (!countdown) return;
        const duration = 1500;
        const start = performance.now();
        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCdVals({
                years: Math.round(countdown.years * eased),
                months: Math.round(countdown.months * eased),
                days: Math.round(countdown.days * eased),
            });
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }, [countdown]);



    const tasks = formData.tasks
        .split(/[,\n]+/).map(t => t.trim())
        .filter(t => t.length > 0 && t.length < 40).slice(0, 5);

    const dateStr = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

    const downloadCard = useCallback(async () => {
        try {
            const { toPng } = await import('html-to-image');
            const dataUrl = await toPng(cardRef.current, {
                backgroundColor: "#0e0c24",
                pixelRatio: 2,
                cacheBust: true,
            });

            // Send to server API which returns with proper Content-Disposition headers
            const response = await fetch('/api/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageData: dataUrl }),
            });

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'isaireplacing.me.png';
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 100);
        } catch (e) {
            console.error("Download failed:", e);
            alert("Download failed. Please try taking a screenshot instead!");
        }
    }, []);

    const shareText = `💀 I just found out AI will replace my ${formData.role} job.\nMy AI Replaceability Score: ${score}%\nCheck yours before it's too late 👉\n#REPLACED #AIReplaceability #CareerDoom`;

    return (
        <section className="screen active" id="result-section">
            <div className="result-container">
                <h2 className="result-header">Your Career Autopsy Report 💀</h2>

                <div className="result-content">
                    {/* LEFT COLUMN: THE SHAREABLE CARD */}
                    <div className="result-card-wrapper">
                        <div className="result-card" ref={cardRef}>
                            <div className="card-noise" />
                            <div className="card-inner">
                                <div className="card-ribbon">
                                    <span className="ribbon-left">💀 REPLACED</span>
                                    <span className={`card-badge ${badge.cls}`}>{badge.text}</span>
                                </div>

                                <div className="card-identity">
                                    <h3 className="card-name">{formData.name}</h3>
                                    <p className="card-role">{formData.role}</p>
                                    <span className="card-exp">{formData.experience} yrs exp</span>
                                </div>

                                <div className="card-divider"><span className="divider-skull">☠️</span></div>

                                <div className="card-countdown">
                                    <p className="cd-label">YOUR JOB EXPIRES IN</p>
                                    <div className="cd-timer">
                                        <div className="cd-unit"><span className="cd-val">{cdVals.years}</span><span className="cd-txt">YRS</span></div>
                                        <span className="cd-sep">:</span>
                                        <div className="cd-unit"><span className="cd-val">{cdVals.months}</span><span className="cd-txt">MOS</span></div>
                                        <span className="cd-sep">:</span>
                                        <div className="cd-unit"><span className="cd-val">{cdVals.days}</span><span className="cd-txt">DAYS</span></div>
                                    </div>
                                </div>

                                <div className="card-tasks">
                                    {tasks.map((t, i) => <span key={i} className="task-tag">{t}</span>)}
                                </div>

                                <div className="card-roast"><p className="roast-text">{roast}</p></div>

                                <div className="card-foot">
                                    <span className="cf-url">try yours @ <span className="cf-domain">isaireplacing.me</span></span>
                                    <span className="cf-date">{dateStr}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: SIDEBAR */}
                    <div className="result-sidebar">
                        {/* ORG INTEL — OUTSIDE THE CARD */}
                        <div className="org-intel-section">
                            <div className="org-intel-header"><span>🔒</span><span>Private Insight — Not included in shareable card</span></div>
                            <div className="org-intel-body">
                                <h4 className="org-intel-org">{formData.organisation}</h4>
                                <p className="org-intel-text">{orgIntel.note}</p>
                            </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="result-actions">
                            <button className="action-btn download-btn" onClick={downloadCard}><span>📥</span> Download Card</button>
                            <button className="action-btn share-btn twitter" onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent("https://isaireplacing.me")}`, "_blank")}><span>𝕏</span> Post on X</button>
                            <button className="action-btn share-btn linkedin" onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://isaireplacing.me")}`, "_blank")}><span>in</span> Share on LinkedIn</button>
                            <button className="action-btn share-btn whatsapp" onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`💀 REPLACED — AI Replaceability Score\n\nI'm a ${formData.role} and my score is ${score}%!\nFind your career's expiry date: https://isaireplacing.me\n\n#REPLACED`)}`, "_blank")}><span>💬</span> WhatsApp</button>
                        </div>
                        <button className="back-btn" onClick={onReset}>🔄 Bury Another Career</button>
                    </div>
                </div>
            </div>
        </section>
    );
}
