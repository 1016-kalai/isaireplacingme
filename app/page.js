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

            console.log(">>> [BROWSER] Calculation complete. Result:", finalResult);
            console.log(">>> [BROWSER] Triggering saveScanResult...");

            saveScanResult(formData, finalResult)
                .then(res => console.log(">>> [BROWSER] Save response from server:", res))
                .catch(err => console.error(">>> [BROWSER] Server Action failed:", err));

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

            console.log(">>> [BROWSER] Using fallback result. Triggering save...");
            saveScanResult(formData, finalResult)
                .then(res => console.log(">>> [BROWSER] Fallback save result:", res))
                .catch(err => console.error(">>> [BROWSER] Fallback save failed:", err));

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
