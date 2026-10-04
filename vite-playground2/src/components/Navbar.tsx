import React, { useState, useEffect } from 'react';

interface NavbarProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSearch,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState<string>(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    onSearch(query.trim());
  };

  return (
    <div className="nav">
      <ul>
        <li>
          <a href="#">Home</a>
        </li>
        <li>
          <a href="#">Our team</a>
        </li>
        <li>
          <a href="#">Projects</a>
        </li>
        <li>
          <a href="#">Blog</a>
        </li>
      </ul>

      <form className="search" onSubmit={handleSubmit}>
        <label htmlFor="search-box">Search: </label>
        <input
          type="search"
          id="search-box"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
          placeholder="Search query"
        />
        <input type="submit" value="Go!" />
      </form>
    </div>
  );
};
