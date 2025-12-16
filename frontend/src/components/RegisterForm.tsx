import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, isLoading, error, clearError } = useAuthStore();
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (password !== confirmPassword) {
      setLocalError('Hesla se neshodují');
      return;
    }

    if (password.length < 6) {
      setLocalError('Heslo musí mít alespoň 6 znaků');
      return;
    }

    try {
      await register(username, email, password);
      onSuccess?.();
    } catch {
      // Error is handled by store
    }
  };

  const displayError = error || localError;

  return (
    <div className="register-form">
      <h2>Registrace</h2>
      
      {displayError && (
        <div className="error-message" style={{ 
          padding: '10px', 
          backgroundColor: '#fee', 
          color: '#c00', 
          borderRadius: '4px',
          marginBottom: '15px'
        }}>
          {displayError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Uživatelské jméno:</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '5px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </div>

        <div className="form-group" style={{ marginTop: '15px' }}>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '5px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </div>

        <div className="form-group" style={{ marginTop: '15px' }}>
          <label htmlFor="password">Heslo:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '5px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </div>

        <div className="form-group" style={{ marginTop: '15px' }}>
          <label htmlFor="confirmPassword">Potvrdit heslo:</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '5px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '10px',
            marginTop: '20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          {isLoading ? 'Registrace...' : 'Zaregistrovat se'}
        </button>
      </form>

      {onSwitchToLogin && (
        <p style={{ marginTop: '15px', textAlign: 'center' }}>
          Již máte účet?{' '}
          <button
            onClick={onSwitchToLogin}
            style={{
              background: 'none',
              border: 'none',
              color: '#007bff',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Přihlaste se
          </button>
        </p>
      )}
    </div>
  );
};
