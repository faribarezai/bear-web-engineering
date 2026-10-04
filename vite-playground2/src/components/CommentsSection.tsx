import React, { useState } from 'react';
import type { CommentItem } from '../ts/models';

export const CommentsSection: React.FC = () => {
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [comments, setComments] = useState<CommentItem[]>([
        {
            id: crypto.randomUUID(),
            name: 'Bob Fossil',
            comment: 'Oh I am so glad you taught me all about the big brown angry guys...',
        },
    ]);

    const [authorName, setAuthorName] = useState<string>('');
    const [commentText, setCommentText] = useState<string>('');

    // Neu: State für die Fehlermeldung bei Validierung
    const [formError, setFormError] = useState<string | null>(null);

    const commentCount = comments.length;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedName = authorName.trim();
        const trimmedComment = commentText.trim();

        // Validierung mit visueller Rückmeldung
        if (!trimmedName || !trimmedComment) {
            setFormError('Please fill out both name and comment fields!');
            return;
        }

        const newCommentItem: CommentItem = {
            id: crypto.randomUUID(),
            name: trimmedName,
            comment: trimmedComment,
        };

        setComments((prevComments) => [...prevComments, newCommentItem]);

        // Formular & Fehler zurücksetzen
        setAuthorName('');
        setCommentText('');
        setFormError(null);
    };

    return (
        <section className="comments">
            <button
                className="show-hide"
                type="button"
                aria-expanded={isVisible}
                onClick={() => setIsVisible((prev) => !prev)}
            >
                {isVisible ? 'Hide comments' : 'Show comments'}
            </button>

            {isVisible && (
                <div className="comment-wrapper">
                    <h2>Add comment</h2>
                    <form className="comment-form" onSubmit={handleSubmit}>
                        <div className="flex-pair">
                            <label htmlFor="name">
                                Your name:
                                <input
                                    type="text"
                                    id="name"
                                    value={authorName}
                                    onChange={(e) => {
                                        setAuthorName(e.target.value);
                                        if (formError) setFormError(null); // Fehler beim Tippen zurücksetzen
                                    }}
                                    placeholder="Enter your name"
                                />
                            </label>
                        </div>
                        <div className="flex-pair">
                            <label htmlFor="comment">
                                Your comment:
                                <input
                                    type="text"
                                    id="comment"
                                    value={commentText}
                                    onChange={(e) => {
                                        setCommentText(e.target.value);
                                        if (formError) setFormError(null); // Fehler beim Tippen zurücksetzen
                                    }}
                                    placeholder="Enter your comment"
                                />
                            </label>
                        </div>

                        {/* Rote Fehlermeldung anzeigen */}
                        {formError && (
                            <p style={{ color: 'red', fontSize: '1.4rem', textAlign: 'center', margin: '5px 0' }}>
                                {formError}
                            </p>
                        )}

                        <div>
                            <input type="submit" value="Submit comment" />
                        </div>
                    </form>

                    <h2>Comments ({commentCount})</h2>
                    <ul className="comment-container">
                        {comments.map((item) => (
                            <li key={item.id}>
                                <p>{item.name}</p>
                                <p>{item.comment}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </section>
    );
};