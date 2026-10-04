import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Bear } from '../ts/models';
import { loadBears } from '../ts/bearService';

const FALLBACK_IMAGE = '/media/wild-bear.jpg';

export const BearDetail: React.FC = () => {
  const { binomial } = useParams<{ binomial: string }>();

  const [bear, setBear] = useState<Bear | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [imgSrc, setImgSrc] = useState<string>(FALLBACK_IMAGE);

  useEffect(() => {
    const controller = new AbortController();

    // 1. Expliziter Return Type : Promise<void>
    const fetchBearDetail = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const bears = await loadBears();
        // 2. Nullish coalescing (?? statt ||) & Null-Check
        const decodedBinomial = decodeURIComponent(binomial ?? '');
        const foundBear = bears.find((b) => b.binomial === decodedBinomial);

        if (!controller.signal.aborted) {
          // 3. Expliziter null/undefined-Check für Objekte
          if (foundBear !== undefined) {
            setBear(foundBear);
            // 4. Nullish coalescing (?? statt ||) & String-Check
            const bearImg = foundBear.image ?? '';
            setImgSrc(bearImg.trim().length > 0 ? bearImg : FALLBACK_IMAGE);
          } else {
            setError('Bear not found.');
          }
        }
      } catch (err: unknown) {
        if (!controller.signal.aborted) {
          setError(
            err instanceof Error ? err.message : 'Failed to load bear details.'
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    // 5. Void-Operator für unhandled Promise
    void fetchBearDetail();

    return () => {
      controller.abort();
    };
  }, [binomial]);

  if (isLoading) {
    return (
      <article>
        <h2>Loading...</h2>
        <p style={{ fontSize: '2rem', padding: '20px 0' }}>
          Loading bear details from Wikipedia...
        </p>
      </article>
    );
  }

  // 6. Explizite null-Checks für error und bear
  if (error !== null || bear === null) {
    return (
      <article>
        <h2>Error</h2>
        <p style={{ color: 'red', fontSize: '1.8rem' }}>
          {error ?? 'Bear not found.'}
        </p>
        <div style={{ marginTop: '20px' }}>
          <Link to="/">← Back to overview</Link>
        </div>
      </article>
    );
  }

  return (
    <article>
      <h2>{bear.name}</h2>
      <p>
        <em>{bear.binomial}</em>
      </p>
      <br />
      <img
        src={imgSrc}
        alt={bear.name}
        onError={() => {
          setImgSrc(FALLBACK_IMAGE);
        }}
      />
      <br />
      <p>
        <strong>Range:</strong> {bear.range}
      </p>
      <div style={{ marginTop: '20px' }}>
        <Link to="/">← Back to overview</Link>
      </div>
    </article>
  );
};
