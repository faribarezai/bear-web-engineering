import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Bear } from '../ts/models';

interface BearCardProps {
  bear: Bear;
}

const FALLBACK_IMAGE = '/media/wild-bear.jpg';

export const BearCard: React.FC<BearCardProps> = ({ bear }) => {
  const rawImage = bear.image ?? '';
  const initialImg = rawImage.trim().length > 0 ? rawImage : FALLBACK_IMAGE;

  const [imgSrc, setImgSrc] = useState<string>(initialImg);

  const bearUrlPath = `/bear/${encodeURIComponent(bear.binomial)}`;

  return (
    <div className="bear">
      <h3>
        <Link to={bearUrlPath}>{bear.name}</Link>
      </h3>
      <p>
        <em>{bear.binomial}</em>
      </p>
      <Link to={bearUrlPath}>
        <img
          src={imgSrc}
          alt={bear.name}
          onError={() => {
            setImgSrc(FALLBACK_IMAGE);
          }}
        />
      </Link>
      <p>
        <strong>Range:</strong> {bear.range}
      </p>
    </div>
  );
};
