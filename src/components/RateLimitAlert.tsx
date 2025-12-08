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
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded-md shadow-sm animate-pulse">
            <div className="flex">
                <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                        Límite de cuota alcanzado
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                        <p>
                            Has utilizado todas las peticiones gratuitas. Podrás procesar más facturas en:
                            <span className="font-bold ml-1 text-lg">{timeLeft} segundos</span>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
