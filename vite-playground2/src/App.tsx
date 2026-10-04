import React from 'react';
import { Routes, Route, useSearchParams, useNavigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { CommentsSection } from './components/CommentsSection';
import { MoreBears } from './components/MoreBears';
import { BearDetail } from './components/BearDetail';
import { HighlightedText } from './components/HighlightedText';

export const App: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // 1. Strict boolean check & Nullish coalescing (?? statt ||)
  const queryParam = searchParams.get('q');
  const searchTerm = queryParam ?? '';

  // 2. Expliziter Rückgabetyp: void
  const handleSearch = (query: string): void => {
    if (query.trim().length > 0) {
      setSearchParams({ q: query });
    } else {
      setSearchParams({});
    }

    // 3. Void-Operator für unhandled Promise bei navigate() & explizite String-Prüfung
    const targetUrl = `/?${query.trim().length > 0 ? `q=${encodeURIComponent(query)}` : ''}`;
    void navigate(targetUrl);
  };

  return (
    <div id="root">
      <Header />
      <Navbar onSearch={handleSearch} initialQuery={searchTerm} />

      <main>
        <Routes>
          {/* Main Overview Route */}
          <Route
            path="/"
            element={
              <article>
                <h2>
                  <HighlightedText
                    text="The trouble with Bears"
                    highlight={searchTerm}
                  />
                </h2>
                <br />
                <br />
                By Evan Wild
                <br />
                <br />
                <HighlightedText
                  text="Tall, lumbering, angry, dangerous. The real live bears of this world are proud, independent creatures, self-serving and always on the hunt for food."
                  highlight={searchTerm}
                />
                <br />
                <br />
                <h3>Types of bear</h3>
                <br />
                <br />
                <table>
                  <thead>
                    <tr>
                      <th>Bear Type</th>
                      <th>Coat</th>
                      <th>Adult size</th>
                      <th>Habitat</th>
                      <th>Lifespan</th>
                      <th>Diet</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Wild</td>
                      <td>Brown or black</td>
                      <td>1.4 to 2.8 meters</td>
                      <td>Woods and forests</td>
                      <td>25 to 28 years</td>
                      <td>Fish, meat, plants</td>
                    </tr>
                    <tr>
                      <td>Urban</td>
                      <td>North Face</td>
                      <td>18 to 22</td>
                      <td>Condos and coffee shops</td>
                      <td>20 to 32 years</td>
                      <td>Starbucks, sushi</td>
                    </tr>
                  </tbody>
                </table>
                <h3>Habitats and Eating habits</h3>
                <br />
                <br />
                <p>
                  <HighlightedText
                    text="Wild bears eat a variety of meat, fish, fruit, nuts, and other naturally growing ingredients..."
                    highlight={searchTerm}
                  />
                </p>
                <br />
                <br />
                <img src="/media/wild-bear.jpg" alt="Wild bear in forest" />
                <br />
                <br />
                <audio controls>
                  <source src="/media/bear.mp3" type="audio/mp3" />
                  <source src="/media/bear.ogg" type="audio/ogg" />
                </audio>
                <aside>
                  <h3>About the author</h3>
                  <p>Evan Wild is an unemployed plumber from Doncaster...</p>
                </aside>
                <CommentsSection />
                <MoreBears />
              </article>
            }
          />

          {/* Bear Detail Route */}
          <Route path="/bear/:binomial" element={<BearDetail />} />
        </Routes>

        <div className="secondary">
          <h2>Related</h2>
          <ul>
            <li>
              <a href="#">The trouble with Bees</a>
            </li>
            <li>
              <a href="#">The trouble with Otters</a>
            </li>
            <li>
              <a href="#">The trouble with Penguins</a>
            </li>
            <li>
              <a href="#">The trouble with Octopi</a>
            </li>
            <li>
              <a href="#">The trouble with Lemurs</a>
            </li>
          </ul>
        </div>
      </main>

      <footer>
        <p>©Copyright 2050 by nobody. All rights reversed.</p>
      </footer>
    </div>
  );
};
