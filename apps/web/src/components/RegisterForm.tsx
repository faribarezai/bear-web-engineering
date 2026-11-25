import React, { useState } from 'react';

interface ProblemResponse {
  detail?: string;
  errors?: Array<{ field: string; message: string }>;
}

interface RegisteredUser {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

export const RegisterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const problem = (await response.json()) as ProblemResponse;
        const fieldMsg = problem.errors?.[0]?.message;
        setError(
          fieldMsg ??
            problem.detail ??
            `Registration failed (${response.status}).`
        );
        return;
      }

      const user = (await response.json()) as RegisteredUser;
      setSuccess(`Account created for ${user.email} (role: ${user.role}).`);
      setEmail('');
      setPassword('');
    } catch {
      setError('Network error while contacting the server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="comments" style={{ marginBottom: '2rem' }}>
      <h2>Register</h2>
      <form
        className="comment-form"
        onSubmit={(e) => {
          handleSubmit(e).catch(() => {});
        }}
      >
        <div className="flex-pair">
          <label htmlFor="register-email">Email:</label>
          <input
            id="register-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            placeholder="bearlover@example.com"
            required
          />
        </div>
        <div className="flex-pair">
          <label htmlFor="register-password">Password:</label>
          <input
            id="register-password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            placeholder="Min. 12 characters"
            minLength={12}
            required
          />
        </div>

        {error !== null && <p className="form-error">{error}</p>}
        {success !== null && (
          <p
            style={{
              color: '#1b5e20',
              fontWeight: 'bold',
              textAlign: 'center',
            }}
          >
            {success}
          </p>
        )}

        <input
          type="submit"
          value={submitting ? 'Registering...' : 'Register'}
          disabled={submitting}
        />
      </form>
    </section>
  );
};
