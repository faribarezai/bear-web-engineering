import React, { useState } from 'react';
import type { Bear } from '../ts/models';

const PLACEHOLDER_IMAGE = '/media/wild-bear.jpg';

interface BearCardProps {
    bear: Bear;
}

export const BearCard: React.FC<BearCardProps> = ({ bear }) => {
    const initialSrc = bear.image && bear.image !== '' ? bear.image : PLACEHOLDER_IMAGE;
    const [imgSrc, setImgSrc] = useState<string>(initialSrc);

    const handleError = () => {
        if (imgSrc !== PLACEHOLDER_IMAGE) {
            setImgSrc(PLACEHOLDER_IMAGE);
        }
    };

    return (
        <div className="bear">
            <img
                src={imgSrc}
                alt={`Image of ${bear.name}`}
                onError={handleError}
                style={{ width: '200px', height: 'auto' }}
            />
            <p>
                <b>{bear.name}</b> ({bear.binomial})
            </p>
            <p>Range: {bear.range}</p>
        </div>
    );
};