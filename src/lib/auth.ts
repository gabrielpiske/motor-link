import { getAuth, signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, type Auth, type User, type NextOrObserver } from 'firebase/auth';
import { app, isFirebaseConfigured } from './firebase';

// Inicializa auth apenas se o Firebase estiver configurado
let auth: Auth | null = null;
if (isFirebaseConfigured && app) {
  auth = getAuth(app);
}

export const signIn = async (email: string, password: string) => {
  if (!auth) throw new Error('Firebase não configurado.');
  return await signInWithEmailAndPassword(auth, email, password);
};

export const signOut = async () => {
  document.cookie = "__ml_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  if (!auth) return;
  return await firebaseSignOut(auth);
};

export const onAuthChange = (callback: NextOrObserver<User>) => {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
};

export const getAuthToken = async () => {
  if (!auth) return null;
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken();
};

export const setSessionCookie = async (user: User | null) => {
  if (user) {
    const token = await user.getIdToken();
    document.cookie = `__ml_session=${token}; path=/; max-age=86400; SameSite=Strict`;
  } else {
    document.cookie = "__ml_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
};

export { auth };

