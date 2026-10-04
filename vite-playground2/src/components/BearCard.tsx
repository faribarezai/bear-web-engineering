import React, { useState } from 'react';
import type { Bear } from '../ts/models';

interface BearCardProps {
    bear: Bear;
}

const FALLBACK_IMAGE = '/media/wild-bear.jpg';

export const BearCard: React.FC<BearCardProps> = ({ bear }) => {
    // Initialisieren des Bildpfads (falls bear.image fehlt, direkt Fallback nutzen)
    const initialImg = bear.image ? bear.image : FALLBACK_IMAGE;
    const [imgSrc, setImgSrc] = useState<string>(initialImg);

    const handleImageError = () => {
        // Wikipedia image !laden, auf Fallback ausweichen
        if (imgSrc !== FALLBACK_IMAGE) {
            setImgSrc(FALLBACK_IMAGE);
        }
    };

    return (
        <div className="bear">
            <h3>{bear.name}</h3>
            <p>
                <em>{bear.binomial}</em>
            </p>
            <img
                src={imgSrc}
                alt={bear.name}
                onError={handleImageError}
            />
            <p><strong>Range:</strong> {bear.range}</p>
        </div>
    );
};