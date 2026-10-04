import React, { useState } from 'react';
import type { CommentItem } from '../ts/models';

export const CommentsSection: React.FC = () => {
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [comments, setComments] = useState<CommentItem[]>([
        {
            id: '1',
            name: 'Bob Fossil',
            comment: 'Oh I am so glad you taught me all about the big brown angry guys...',
        },
    ]);

    const [name, setName] = useState<string>('');
    const [commentText, setCommentText] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedName = name.trim();
        const trimmedComment = commentText.trim();

        if (trimmedName === '' || trimmedComment === '') {
            setError('Please enter both your name and a comment.');
            return;
        }

        setError(null);
        const newComment: CommentItem = {
            id: crypto.randomUUID(),
            name: trimmedName,
            comment: trimmedComment,
        };

        setComments((prev) => [...prev, newComment]);
        setName('');
        setCommentText('');
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
                        {error && (
                            <p className="form-error" role="alert">
                                {error}
                            </p>
                        )}

                        <div className="flex-pair">
                            <label htmlFor="name">
                                Your name:
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                />
                            </label>
                        </div>

                        <div className="flex-pair">
                            <label htmlFor="comment">
                                Your comment:
                                <input
                                    type="text"
                                    name="comment"
                                    id="comment"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Enter your comment"
                                />
                            </label>
                        </div>

                        <div>
                            <input type="submit" value="Submit comment" />
                        </div>
                    </form>

                    <h2>Comments</h2>
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