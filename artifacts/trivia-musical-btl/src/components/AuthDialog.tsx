import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { AuthState } from '../hooks/useAuth';

type AuthDialogProps = Pick<AuthState, 'isSubmitting' | 'signIn' | 'signUp'> & {
  onClose: () => void;
};

export function AuthDialog({ isSubmitting, signIn, signUp, onClose }: AuthDialogProps) {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');

    try {
      if (mode === 'sign-up') {
        const username = String(form.get('username') ?? '').trim();
        const result = await signUp({ email, password, username });
        if (result.requiresEmailConfirmation) {
          setNotice('Cuenta creada. Revisa tu correo para confirmar el registro.');
          return;
        }
      } else {
        await signIn({ email, password });
      }
      onClose();
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Ocurrió un error de autenticación.');
    }
  }

  return (
    <div
      className="auth-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="auth-close" type="button" onClick={onClose} aria-label="Cerrar">
          <X size={18} aria-hidden="true" />
        </button>
        <div className="eyebrow"><span className="eyebrow-line" /> Tu cuenta Ritmo</div>
        <h2 id="auth-title">{mode === 'sign-in' ? 'Inicia sesión' : 'Crea tu cuenta'}</h2>
        <p className="auth-description">Guarda tus resultados y vuelve a jugar cuando quieras.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'sign-up' && (
            <label>
              Username
              <input name="username" autoComplete="nickname" required maxLength={40} />
            </label>
          )}
          <label>
            Correo electrónico
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            Contraseña
            <input
              name="password"
              type="password"
              autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
              minLength={6}
              required
            />
          </label>
          {error && <p className="app-notice is-error" role="alert">{error}</p>}
          {notice && <p className="app-notice" role="status">{notice}</p>}
          <button className="primary-button auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'Procesando…'
              : mode === 'sign-in'
                ? 'Iniciar sesión'
                : 'Crear cuenta'}
          </button>
        </form>
        <button
          className="auth-switch"
          type="button"
          onClick={() => {
            setMode((current) => current === 'sign-in' ? 'sign-up' : 'sign-in');
            setError('');
            setNotice('');
          }}
        >
          {mode === 'sign-in' ? '¿Primera vez? Crear una cuenta' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
      </section>
    </div>
  );
}
