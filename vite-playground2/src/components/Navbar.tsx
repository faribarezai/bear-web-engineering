import React, { useState } from 'react';

interface NavbarProps {
    onSearch: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(searchTerm.trim());
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
                    name="q"
                    placeholder="Search query"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <input type="submit" value="Go!" />
            </form>
        </div>
    );
};