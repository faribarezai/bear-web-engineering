import React, { useState } from 'react';

interface NavbarProps {
    onSearch: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearch }) => {
    // Controlled Input für die Suchleiste
    const [query, setQuery] = useState<string>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query.trim());
    };

    return (
        <div className="nav">
            <ul>
                <li><a href="#">Home</a></li>
                <li><a href="#">Our team</a></li>
                <li><a href="#">Projects</a></li>
                <li><a href="#">Blog</a></li>
            </ul>

            <form className="search" onSubmit={handleSubmit}>
                <label htmlFor="search-box">Search: </label>
                <input
                    type="search"
                    id="search-box"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search query"
                />
                <input type="submit" value="Go!" />
            </form>
        </div>
    );
};