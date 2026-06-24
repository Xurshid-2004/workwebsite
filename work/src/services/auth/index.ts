import { isFirebaseConfigured } from '@/lib/firebase/client';
import { getActiveAuthProvider } from '@/lib/auth/config';
import { mockAuthRepository } from './mock-auth.adapter';
import { firebaseAuthRepository } from './firebase-auth.adapter';
import type { AuthRepository } from '@/lib/auth/repository';

export function getAuthRepository(): AuthRepository {
  const provider = getActiveAuthProvider();

  if (provider === 'firebase' && isFirebaseConfigured()) {
    return firebaseAuthRepository;
  }

  return mockAuthRepository;
}
