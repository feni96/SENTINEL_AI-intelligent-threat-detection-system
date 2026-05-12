import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

export default function ResetPassword() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(true);

  useEffect(() => {
    if (!token) {
      setValidToken(false);
      setError(t('invalidResetLink'));
    }
  }, [token, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      return;
    }
    if (newPassword.length < 8) {
      setError(t('passwordMinLength'));
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/reset-password', { token, newPassword });
      setMessage(response.data?.message || t('passwordResetSuccess'));
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.response?.data?.message || t('resetFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (!validToken) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1>{t('invalidResetLink')}</h1>
          <Link to="/forgot-password">{t('requestNewLink')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>{t('resetPassword')}</h1>
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <i className="bi bi-lock"></i>
            <input
              type="password"
              placeholder={t('newPassword')}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <i className="bi bi-lock-fill"></i>
            <input
              type="password"
              placeholder={t('confirmNewPassword')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? t('resetting') : t('resetPassword')}
          </button>
        </form>
        <div className="auth-footer">
          <Link to="/login">{t('backToLogin')}</Link>
        </div>
      </div>
    </div>
  );
}