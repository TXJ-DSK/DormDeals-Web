import { child, get, onValue, push, ref, remove, set, update } from 'firebase/database';

import { db } from '../firebase/firebase';
import type { Listing as UIListing } from '../types/Listing';

export type Listing = Omit<UIListing, 'createdAt'> & {
  id?: string;
  createdAt?: number;
};

type ListingRecord = Omit<Listing, 'id' | 'createdAt'> & {
  createdAt?: number;
};

const toArray = (data: Record<string, ListingRecord>): Listing[] =>
  Object.keys(data).map((key) => ({
    id: key,
    ...data[key],
  }));

/**
 * One-time fetch (kept for backwards compat)
 */
export async function getListings(): Promise<Listing[]> {
  const snapshot = await get(child(ref(db), 'listings'));
  if (!snapshot.exists()) return [];
  return toArray(snapshot.val() as Record<string, ListingRecord>);
}

/**
 * Real-time subscription using websocket to firebase
 * first with current data, then on every change, support of real time updates
 */
export function subscribeToListings(callback: (listings: Listing[]) => void): () => void {
  const listingsRef = ref(db, 'listings');
  const unsubscribe = onValue(listingsRef, (snapshot) => {
    if (!snapshot.exists()) return callback([]);
    callback(toArray(snapshot.val() as Record<string, ListingRecord>));
  });
  return unsubscribe;
}

/**
 * Create a new listing in Realtime Database
 */
export async function createListing(listing: Listing): Promise<string> {
  const listingsRef = ref(db, 'listings');
  const newRef = push(listingsRef);

  await set(newRef, {
    title: listing.title,
    description: listing.description,
    image: listing.image,
    furnitureType: listing.furnitureType,
    price: listing.price,
    condition: listing.condition,
    location: listing.location,
    deliveryMethod: listing.deliveryMethod,
    createdAt: listing.createdAt ?? Date.now(),
    userId: listing.userId ?? 'currentUser',
    sellerContact: listing.sellerContact,
  });

  return newRef.key as string;
}

export async function updateListing(id: string, data: Partial<Listing>): Promise<void> {
  await update(ref(db, `listings/${id}`), data);
}

export async function deleteListing(id: string): Promise<void> {
  await remove(ref(db, `listings/${id}`));
}
