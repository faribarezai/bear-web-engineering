import React, { useEffect, useState } from 'react';
import type { Bear } from '../ts/models';
import { loadBears } from '../ts/bearService';
import { BearCard } from './BearCard';

export const MoreBears: React.FC = () => {
    // Explizite Zustände für das Remote Data Fetching
    const [bears, setBears] = useState<Bear[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // AbortController zur Vermeidung von Race Conditions und Stale Data
        const controller = new AbortController();

        const fetchBears = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Aufruf deiner echten Service-Funktion
                const fetchedBears = await loadBears();

                // Nur den State aktualisieren, wenn der Request nicht in der Zwischenzeit abgebrochen wurde
                if (!controller.signal.aborted) {
                    setBears(fetchedBears);
                }
            } catch (err: unknown) {
                if (!controller.signal.aborted) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : 'Failed to load bears from Wikipedia.'
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        fetchBears();

        // Cleanup-Funktion: Bricht laufende Vorgänge beim Unmount ab
        return () => {
            controller.abort();
        };
    }, []);

    return (
        <section className="more_bears">
            <h3>More Bears</h3>

            {/* 1. Loading State */}
            {isLoading && <p>Loading bears from Wikipedia...</p>}

            {/* 2. Error State */}
            {error && (
                <p role="alert" style={{ color: 'red', fontSize: '1.6rem' }}>
                    {error}
                </p>
            )}

            {/* 3. Empty State */}
            {!isLoading && !error && bears.length === 0 && (
                <p>No bears found.</p>
            )}

            {/* 4. Success State */}
            {!isLoading && !error && bears.length > 0 && (
                <div className="bear-list">
                    {bears.map((bear) => (
                        <BearCard key={bear.binomial} bear={bear} />
                    ))}
                </div>
            )}
        </section>
    );
};