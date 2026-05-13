import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setMessage(response.data?.message || 'Reset link sent to your email');
      setEmail(''); // Clear the email field on success
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || 
                          err.response?.data?.message || 
                          'Something went wrong. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>{t('forgotPassword')}</h1>
        <p>{t('forgotPasswordInstructions')}</p>
        <div className="info-message" style={{ backgroundColor: '#e3f2fd', border: '1px solid #90caf9', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px' }}>
          <strong>Note:</strong> Only the administrator email (fenetmahdi@gmail.com) can reset the password.
        </div>
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <i className="bi bi-envelope"></i>
            <input
              type="email"
              placeholder={t('email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? t('sending') : t('sendResetLink')}
          </button>
        </form>
        <div className="auth-footer">
          <Link to="/login">{t('backToLogin')}</Link>
        </div>
      </div>
    </div>
  );
}