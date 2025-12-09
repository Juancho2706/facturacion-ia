'use client';

import { useState, useEffect } from 'react';

interface RateLimitAlertProps {
    retryUntil: Date | null;
    onCooldownFinished: () => void;
}

export function RateLimitAlert({ retryUntil, onCooldownFinished }: RateLimitAlertProps) {
    const [timeLeft, setTimeLeft] = useState<number>(0);

    useEffect(() => {
        if (!retryUntil) return;

        const interval = setInterval(() => {
            const now = new Date();
            const diff = Math.ceil((retryUntil.getTime() - now.getTime()) / 1000);

            if (diff <= 0) {
                setTimeLeft(0);
                clearInterval(interval);
                onCooldownFinished();
            } else {
                setTimeLeft(diff);
            }
        }, 1000);

        // Initial check
        const initialDiff = Math.ceil((retryUntil.getTime() - new Date().getTime()) / 1000);
        setTimeLeft(initialDiff > 0 ? initialDiff : 0);

        return () => clearInterval(interval);
    }, [retryUntil, onCooldownFinished]);

    if (!retryUntil || timeLeft <= 0) return null;

    return (
        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 p-6 mb-8 rounded-xl shadow-lg shadow-orange-500/5 animate-pulse relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-2xl -mr-10 -mt-10 rounded-full group-hover:bg-orange-500/20 transition-colors duration-500"></div>

            <div className="relative z-10 flex items-start space-x-4">
                <div className="flex-shrink-0 bg-orange-500/20 p-2 rounded-lg">
                    <svg className="h-6 w-6 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="flex-1">
                    <h3 className="text-base font-bold text-orange-400 uppercase tracking-wider mb-1">
                        Límite de cuota alcanzado
                    </h3>
                    <div className="mt-1 text-sm text-orange-300/80 leading-relaxed">
                        <p>
                            Has utilizado todas las peticiones gratuitas.
                            <span className="block mt-2 font-mono text-xl font-bold text-orange-200">
                                ⏳ Reintentando en {timeLeft}s
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Progress bar effect */}
            <div className="absolute bottom-0 left-0 h-1 bg-orange-500/30 w-full">
                <div
                    className="h-full bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.5)] transition-all duration-1000 linear"
                    style={{ width: `${(timeLeft / 60) * 100}%` }} // Assuming generic max 60s for visual
                ></div>
            </div>
        </div>
    );
}
