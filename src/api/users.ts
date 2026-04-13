import { get, ref, set } from 'firebase/database';

import { db } from '../firebase/firebase';

export type UserRecord = {
  username: string;
  email: string;
  phone?: string;
};

/**
 * Create or update a user record in Realtime Database.
 * Safe to call on every login — uses set() which is idempotent.
 */
export async function upsertUser(uid: string, data: UserRecord): Promise<void> {
  const userRef = ref(db, `users/${uid}`);
  await set(userRef, data);
}

/**
 * Fetch a single user record by UID.
 */
export async function getUser(uid: string): Promise<UserRecord | null> {
  const userRef = ref(db, `users/${uid}`);
  const snapshot = await get(userRef);
  if (!snapshot.exists()) return null;
  return snapshot.val() as UserRecord;
}
