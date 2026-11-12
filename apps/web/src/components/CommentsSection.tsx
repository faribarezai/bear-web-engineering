import React, { useEffect, useState } from 'react';
import type { CommentItem } from '../ts/models.ts';
import { loadComments, postComment, removeComment } from '../ts/bearService.ts';

interface CommentsSectionProps {
  bearId: string;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ bearId }) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [authorName, setAuthorName] = useState<string>('');
  const [commentText, setCommentText] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchComments = async (): Promise<void> => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const items = await loadComments(bearId, controller.signal);
        if (!controller.signal.aborted) {
          setComments(items);
        }
      } catch (err: unknown) {
        if (!controller.signal.aborted) {
          setLoadError(
            err instanceof Error ? err.message : 'Failed to load comments.'
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void fetchComments();

    return () => {
      controller.abort();
    };
  }, [bearId]);

  const commentCount = comments.length;

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (authorName.trim().length === 0 || commentText.trim().length === 0) {
      setFormError('Please fill out both name and comment fields!');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const created = await postComment(bearId, authorName, commentText);
      setComments((prev) => [...prev, created]);
      setAuthorName('');
      setCommentText('');
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : 'Failed to submit comment.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string): Promise<void> => {
    try {
      await removeComment(commentId);
      setComments((prev) => prev.filter((item) => item.id !== commentId));
    } catch (err: unknown) {
      setLoadError(
        err instanceof Error ? err.message : 'Failed to delete comment.'
      );
    }
  };

  return (
    <section className="comments">
      <button
        type="button"
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

          <form
            className="comment-form"
            onSubmit={(e) => {
              void handleSubmit(e);
            }}
          >
            <div className="flex-pair">
              <label htmlFor="name">Your name:</label>
              <input
                type="text"
                id="name"
                value={authorName}
                maxLength={80}
                onChange={(e) => {
                  setAuthorName(e.target.value);
                }}
                placeholder="Enter your name"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex-pair">
              <label htmlFor="comment">Your comment:</label>
              <textarea
                id="comment"
                value={commentText}
                maxLength={1000}
                onChange={(e) => {
                  setCommentText(e.target.value);
                }}
                placeholder="Enter your comment"
                disabled={isSubmitting}
              />
            </div>

            {formError !== null && <p className="form-error">{formError}</p>}

            <div>
              <input
                type="submit"
                value={isSubmitting ? 'Submitting...' : 'Submit comment'}
                disabled={isSubmitting}
              />
            </div>
          </form>

          <h2>Comments</h2>

          {isLoading && <p>Loading comments...</p>}
          {loadError !== null && <p className="form-error">{loadError}</p>}

          {!isLoading && loadError === null && comments.length === 0 && (
            <p>No comments yet. Be the first to comment!</p>
          )}

          <ul className="comment-container">
            {comments.map((item) => (
              <li key={item.id}>
                <p>
                  <strong>{item.author}</strong>
                </p>
                <p>{item.text}</p>
                <button
                  type="button"
                  onClick={() => {
                    void handleDelete(item.id);
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
