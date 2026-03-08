'use client';
import { useState, useCallback, useTransition } from 'react';
import Particles from '@/components/Particles';
import LandingScreen from '@/components/LandingScreen';
import FormScreen from '@/components/FormScreen';
import LoadingScreen from '@/components/LoadingScreen';
import ResultScreen from '@/components/ResultScreen';
import { calculateScore, scoreToCountdown, getBadge, getRoast } from '@/lib/scoring';
import { getRealOrgIntel, saveScanResult } from '@/app/actions';

export default function Home() {
    const [screen, setScreen] = useState('landing');
    const [formData, setFormData] = useState(null);
    const [result, setResult] = useState(null);
    const [isPending, startTransition] = useTransition();

    const handleFormSubmit = useCallback((data) => {
        setFormData(data);
        setScreen('loading');
    }, []);
    const handleLoadingComplete = useCallback(async () => {
        if (!formData) return;

        let finalResult = null;
        try {
            // Wait for real AI lookup
            const dynamicIntel = await getRealOrgIntel(formData.organisation, formData.industry, formData.role);

            const { score, orgIntel } = calculateScore(formData, dynamicIntel);
            const countdown = scoreToCountdown(score);
            const badge = getBadge(score);
            const roast = getRoast(score, formData);

            finalResult = { score, orgIntel, countdown, badge, roast };
            setResult(finalResult);

            // In Next.js Server Actions executed from Client Components, 
            // blocking the React render cycle with an await can sometimes be dropped by React's scheduler on Vercel.
            // Executing the server action directly.
            startTransition(() => {
                saveScanResult(formData, finalResult).catch(console.error);
            });

            setScreen('result');
        } catch (err) {
            console.error("Score / AI error:", err);
            const fallbackIntel = { mod: 1.0, tier: "unknown", note: "Could not complete full analysis." };
            const fallbackScore = 65;

            finalResult = {
                score: fallbackScore,
                orgIntel: fallbackIntel,
                countdown: scoreToCountdown(fallbackScore),
                badge: getBadge(fallbackScore),
                roast: getRoast(fallbackScore, formData),
            };
            setResult(finalResult);

            startTransition(() => {
                saveScanResult(formData, finalResult).catch(console.error);
            });

            setScreen('result');
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
