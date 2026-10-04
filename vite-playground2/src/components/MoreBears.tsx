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
    // AbortController zur Vermeidung von Race Conditions
    const controller = new AbortController();

    // 1. Expliziter Return Type : Promise<void>
    const fetchBears = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const fetchedBears = await loadBears();

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

    // 2. Void-Operator für unhandled Promise im useEffect
    void fetchBears();

    // Cleanup-Funktion
    return () => {
      controller.abort();
    };
  }, []);

  return (
    <section className="more_bears">
      <h3>More Bears</h3>

      {/* 1. Loading State */}
      {isLoading && <p>Loading bears from Wikipedia...</p>}

      {/* 2. Error State mit explizitem null-Check */}
      {error !== null && (
        <p role="alert" style={{ color: 'red', fontSize: '1.6rem' }}>
          {error}
        </p>
      )}

      {/* 3. Empty State mit explizitem null-Check */}
      {!isLoading && error === null && bears.length === 0 && (
        <p>No bears found.</p>
      )}

      {/* 4. Success State mit explizitem null-Check */}
      {!isLoading && error === null && bears.length > 0 && (
        <div className="bear-list">
          {bears.map((bear) => (
            <BearCard key={bear.binomial} bear={bear} />
          ))}
        </div>
      )}
    </section>
  );
};
