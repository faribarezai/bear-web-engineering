import React from 'react';
import type { Bear } from '../ts/models';
import { BearCard } from './BearCard';

interface MoreBearsProps {
    bears: Bear[];
    isLoading?: boolean;
    error?: string | null;
}

export const MoreBears: React.FC<MoreBearsProps> = ({ bears, isLoading, error }) => {
    return (
        <section className="more_bears">
            <h3>More Bears</h3>
            {isLoading && <p>Loading bears...</p>}
            {error && <p role="alert">{error}</p>}

            <div className="bear-list">
                {bears.map((bear) => (
                    // Eindeutiger & stabiler Key (binomial ist einzigartig pro Art)
                    <BearCard key={bear.binomial} bear={bear} />
                ))}
            </div>
        </section>
    );
};