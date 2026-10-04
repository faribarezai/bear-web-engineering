import React from 'react';

interface HighlightedTextProps {
    text: string;
    highlight: string;
}

function escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const HighlightedText: React.FC<HighlightedTextProps> = ({ text, highlight }) => {
    if (!highlight) {
        return <>{text}</>;
    }

    const regex = new RegExp(`(${escapeRegExp(highlight)})`, 'gi');
    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, index) =>
                part.toLowerCase() === highlight.toLowerCase() ? (
                    <mark key={index} className="highlight">
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </>
    );
};