'use client';
import { useState, useCallback } from 'react';
import Particles from '@/components/Particles';
import LandingScreen from '@/components/LandingScreen';
import FormScreen from '@/components/FormScreen';
import LoadingScreen from '@/components/LoadingScreen';
import ResultScreen from '@/components/ResultScreen';
import { calculateScore, scoreToCountdown, getBadge, getRoast } from '@/lib/scoring';

export default function Home() {
    const [screen, setScreen] = useState('landing');
    const [formData, setFormData] = useState(null);
    const [result, setResult] = useState(null);

    const handleFormSubmit = useCallback((data) => {
        setFormData(data);
        setScreen('loading');
    }, []);
    // Make sure we import getRealOrgIntel at the top of the file!
    const handleLoadingComplete = useCallback(async () => {
        if (!formData) return;
        try {
            // First, trigger the server action (awaiting real AI lookup)
            const { getRealOrgIntel, saveScanResult } = await import('@/app/actions');
            const dynamicIntel = await getRealOrgIntel(formData.organisation, formData.industry, formData.role);

            const { score, orgIntel } = calculateScore(formData, dynamicIntel);
            const countdown = scoreToCountdown(score);
            const badge = getBadge(score);
            const roast = getRoast(score, formData);

            const finalResult = { score, orgIntel, countdown, badge, roast };
            setResult(finalResult);
            setScreen('result');

            // Await the save so Vercel serverless function doesn't die prematurely
            await saveScanResult(formData, finalResult).catch(console.error);
        } catch (err) {
            console.error("Score / AI error:", err);
            const fallbackIntel = { mod: 1.0, tier: "unknown", note: "Could not complete full analysis." };
            const fallbackScore = 65;

            const finalResult = {
                score: fallbackScore,
                orgIntel: fallbackIntel,
                countdown: scoreToCountdown(fallbackScore),
                badge: getBadge(fallbackScore),
                roast: getRoast(fallbackScore, formData),
            };
            setResult(finalResult);
            setScreen('result');

            const { saveScanResult } = await import('@/app/actions');
            await saveScanResult(formData, finalResult).catch(console.error);
        }
    }, [formData]);

    const handleReset = useCallback(() => {
        setScreen('landing');
        setFormData(null);
        setResult(null);
    }, []);

    return (
        <main className="app-container">
            <Particles />
            {screen === 'landing' && (
                <LandingScreen onStart={() => setScreen('form')} />
            )}
            {screen === 'form' && (
                <FormScreen onSubmit={handleFormSubmit} onBack={() => setScreen('landing')} />
            )}
            {screen === 'loading' && (
                <LoadingScreen onComplete={handleLoadingComplete} />
            )}
            {screen === 'result' && result && (
                <ResultScreen
                    formData={formData}
                    score={result.score}
                    orgIntel={result.orgIntel}
                    countdown={result.countdown}
                    badge={result.badge}
                    roast={result.roast}
                    onReset={handleReset}
                />
            )}
        </main>
    );
}
