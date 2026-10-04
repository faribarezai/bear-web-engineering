import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { MoreBears } from './components/MoreBears';
import { CommentsSection } from './components/CommentsSection';
import { HighlightedText } from './components/HighlightedText';
import { loadBears } from './ts/bearService';
import type { Bear } from './ts/models';

export function App() {
    const [bears, setBears] = useState<Bear[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // State für den aktuellen Suchbegriff
    const [searchTerm, setSearchTerm] = useState<string>('');

    useEffect(() => {
        async function fetchBears() {
            try {
                setIsLoading(true);
                const loadedBears = await loadBears();
                setBears(loadedBears);
            } catch (err) {
                console.error('Bear loading failed:', err);
                setError('The bears could not be loaded. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        }

        void fetchBears();
    }, []);

    return (
        <>
            <Header />
            {/* Navbar übergibt die Suchanfrage an den State */}
            <Navbar onSearch={(query) => setSearchTerm(query)} />

            <main>
                <article>
                    <h2>
                        <HighlightedText text="The trouble with Bears" highlight={searchTerm} />
                    </h2>
                    <br /><br />
                    By Evan Wild
                    <br /><br />
                    <p>
                        <HighlightedText
                            text="Tall, lumbering, angry, dangerous. The real live bears of this world are proud, independent creatures, self-serving and always on the hunt for food."
                            highlight={searchTerm}
                        />
                    </p>
                    <br /><br />
                    <h3>
                        <HighlightedText text="Types of bear" highlight={searchTerm} />
                    </h3>
                    <br /><br />
                    <table>
                        <thead>
                        <tr>
                            <td>Bear Type</td>
                            <td>Coat</td>
                            <td>Adult size</td>
                            <td>Habitat</td>
                            <td>Lifespan</td>
                            <td>Diet</td>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>
                                <HighlightedText text="Wild" highlight={searchTerm} />
                            </td>
                            <td>Brown or black</td>
                            <td>1.4 to 2.8 meters</td>
                            <td>Woods and forests</td>
                            <td>25 to 28 years</td>
                            <td>Fish, meat, plants</td>
                        </tr>
                        <tr>
                            <td>
                                <HighlightedText text="Urban" highlight={searchTerm} />
                            </td>
                            <td>North Face</td>
                            <td>18 to 22</td>
                            <td>Condos and coffee shops</td>
                            <td>20 to 32 years</td>
                            <td>Starbucks, sushi</td>
                        </tr>
                        </tbody>
                    </table>

                    <h3>
                        <HighlightedText text="Habitats and Eating habits" highlight={searchTerm} />
                    </h3>
                    <br /><br />
                    <p>
                        <HighlightedText
                            text="Wild bears eat a variety of meat, fish, fruit, nuts, and other naturally growing ingredients..."
                            highlight={searchTerm}
                        />
                    </p>
                    <br /><br />
                    <img src="/media/wild-bear.jpg" alt="Wild bear in forest" />
                    <br /><br />
                    <p>
                        <HighlightedText
                            text="Urban (gentrified) bears on the other hand have largely abandoned the old ways..."
                            highlight={searchTerm}
                        />
                    </p>
                    <br /><br />
                    <img src="/media/urban-bear.jpg" alt="Urban bear near buildings" />
                    <br /><br />

                    <h3>
                        <HighlightedText text="Mating rituals" highlight={searchTerm} />
                    </h3>
                    <br /><br />
                    <p>
                        <HighlightedText
                            text="Bears are romantic creatures by nature..."
                            highlight={searchTerm}
                        />
                    </p>
                    <br /><br />
                    <audio controls>
                        <source src="/media/bear.mp3" type="audio/mp3" />
                        <source src="/media/bear.ogg" type="audio/ogg" />
                        <p>It looks like your browser doesn't support HTML5 audio players.</p>
                    </audio>

                    <aside>
                        <h3>About the author</h3>
                        <br /><br />
                        <p>
                            <HighlightedText
                                text="Evan Wild is an unemployed plumber from Doncaster..."
                                highlight={searchTerm}
                            />
                        </p>
                    </aside>

                    <CommentsSection />

                    <MoreBears bears={bears} isLoading={isLoading} error={error} />
                </article>

                <div className="secondary">
                    <h2>Related</h2>
                    <ul>
                        <li><a href="#">The trouble with Bees</a></li>
                        <li><a href="#">The trouble with Otters</a></li>
                        <li><a href="#">The trouble with Penguins</a></li>
                        <li><a href="#">The trouble with Octopi</a></li>
                        <li><a href="#">The trouble with Lemurs</a></li>
                    </ul>
                </div>
            </main>

            <footer>
                <p>©Copyright 2050 by nobody. All rights reversed.</p>
            </footer>
        </>
    );
}