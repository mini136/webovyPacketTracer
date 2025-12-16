import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const API_URL = 'http://localhost:3000';

export const AdminPanel: React.FC = () => {
  const { user, token, logout } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user' as 'admin' | 'user',
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      loadUsers();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load users');
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create user');
      }

      setFormData({ username: '', email: '', password: '', role: 'user' });
      setShowCreateForm(false);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    }
  };

  const handleToggleActive = async (userId: string) => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/toggle-active`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to toggle user status');
      }

      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle user status');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Opravdu chcete smazat tohoto uživatele?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div style={{ padding: '20px' }}>
        <p>Nemáte oprávnění k přístupu do administračního panelu.</p>
      </div>
    );
  }

  return (
    <div className="admin-panel" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#f5f5f5',
      padding: '20px',
      overflowY: 'auto',
      zIndex: 1000,
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px',
        }}>
          <h1>Administrační panel</h1>
          <div>
            <span style={{ marginRight: '15px' }}>
              Přihlášen jako: <strong>{user.username}</strong> ({user.role})
            </span>
            <button
              onClick={logout}
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Odhlásit se
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            padding: '10px',
            backgroundColor: '#fee',
            color: '#c00',
            borderRadius: '4px',
            marginBottom: '15px',
          }}>
            {error}
          </div>
        )}

        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '20px',
          }}>
            <h2>Správa uživatelů</h2>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {showCreateForm ? 'Zrušit' : '+ Nový uživatel'}
            </button>
          </div>

          {showCreateForm && (
            <form onSubmit={handleCreateUser} style={{
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              marginBottom: '20px',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label>Uživatelské jméno:</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    minLength={3}
                    style={{
                      width: '100%',
                      padding: '8px',
                      marginTop: '5px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                    }}
                  />
                </div>
                <div>
                  <label>Email:</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '8px',
                      marginTop: '5px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                    }}
                  />
                </div>
                <div>
                  <label>Heslo:</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                    style={{
                      width: '100%',
                      padding: '8px',
                      marginTop: '5px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                    }}
                  />
                </div>
                <div>
                  <label>Role:</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      marginTop: '5px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                    }}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                style={{
                  marginTop: '15px',
                  padding: '8px 16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Vytvořit uživatele
              </button>
            </form>
          )}

          {isLoading ? (
            <p>Načítání...</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Username</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Role</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Poslední přihlášení</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Akce</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '12px' }}>{u.username}</td>
                    <td style={{ padding: '12px' }}>{u.email}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: u.role === 'admin' ? '#ffc107' : '#17a2b8',
                        color: 'white',
                        fontSize: '12px',
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: u.isActive ? '#28a745' : '#dc3545',
                        color: 'white',
                        fontSize: '12px',
                      }}>
                        {u.isActive ? 'Aktivní' : 'Neaktivní'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleString('cs-CZ') : '-'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => handleToggleActive(u.id)}
                        disabled={u.id === user.id}
                        style={{
                          padding: '4px 8px',
                          marginRight: '5px',
                          backgroundColor: u.isActive ? '#ffc107' : '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: u.id === user.id ? 'not-allowed' : 'pointer',
                          opacity: u.id === user.id ? 0.5 : 1,
                          fontSize: '12px',
                        }}
                      >
                        {u.isActive ? 'Deaktivovat' : 'Aktivovat'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        disabled={u.id === user.id}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: u.id === user.id ? 'not-allowed' : 'pointer',
                          opacity: u.id === user.id ? 0.5 : 1,
                          fontSize: '12px',
                        }}
                      >
                        Smazat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
