import React, { useState } from 'react';

interface CommentItem {
  id: string;
  name: string;
  comment: string;
}

export const CommentsSection: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [comments, setComments] = useState<CommentItem[]>([
    {
      id: '1',
      name: 'Bob Jackson',
      comment:
        'It is terrifying to think that wild bears eat human beings. I hope I never run into one in Doncaster.',
    },
  ]);
  const [authorName, setAuthorName] = useState<string>('');
  const [commentText, setCommentText] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  const commentCount = comments.length;

  // 1. Expliziter Return Type : void
  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();

    // 2. Explizite Längenprüfung für Strings (length === 0)
    if (authorName.trim().length === 0 || commentText.trim().length === 0) {
      setFormError('Please fill out both name and comment fields!');
      return;
    }

    setComments((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: authorName.trim(),
        comment: commentText.trim(),
      },
    ]);

    setAuthorName('');
    setCommentText('');
    setFormError(null);
  };

  return (
    <section className="comments">
      <button
        className="show-hide"
        onClick={() => {
          setIsVisible((prev) => !prev);
        }}
      >
        {isVisible
          ? 'Hide comments'
          : `Show comments (${commentCount.toString()})`}
      </button>

      {isVisible && (
        <div className="comment-wrapper">
          <h2>Add comment</h2>

          <form className="comment-form" onSubmit={handleSubmit}>
            <div className="flex-pair">
              <label htmlFor="name">Your name:</label>
              <input
                type="text"
                id="name"
                value={authorName}
                onChange={(e) => {
                  setAuthorName(e.target.value);
                }}
                placeholder="Enter your name"
              />
            </div>

            <div className="flex-pair">
              <label htmlFor="comment">Your comment:</label>
              <textarea
                id="comment"
                value={commentText}
                onChange={(e) => {
                  setCommentText(e.target.value);
                }}
                placeholder="Enter your comment"
              />
            </div>

            {/* 3. Expliziter null-Check für formError */}
            {formError !== null && (
              <p style={{ color: 'red', fontWeight: 'bold' }}>{formError}</p>
            )}

            <div>
              <input type="submit" value="Submit comment" />
            </div>
          </form>

          <h2>Comments</h2>
          <ul className="comment-container">
            {comments.map((item) => (
              <li key={item.id}>
                <p>
                  <strong>{item.name}</strong>
                </p>
                <p>{item.comment}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
