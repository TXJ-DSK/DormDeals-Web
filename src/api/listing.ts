// src/api/listings.ts

import { child, get, push, ref, set } from 'firebase/database';

import { db } from '../firebase/firebase';
import type { Listing as UIListing } from '../types/Listing';

export type Listing = Omit<UIListing, 'createdAt'> & {
  id?: string;
  createdAt?: number;
};

type ListingRecord = Omit<Listing, 'id' | 'createdAt'> & {
  createdAt?: number;
};

/**
 * Fetch all listings from Realtime Database
 */
export async function getListings(): Promise<Listing[]> {
  const dbRef = ref(db);

  const snapshot = await get(child(dbRef, 'listings'));

  if (!snapshot.exists()) return [];

  const data = snapshot.val() as Record<string, ListingRecord>;

  // Convert Firebase object → array
  return Object.keys(data).map((key) => {
    const listing = data[key];
    return {
      id: key,
      ...listing,
      createdAt: listing.createdAt,
    };
  });
}

/**
 * Create a new listing in Realtime Database
 */
export async function createListing(listing: Listing): Promise<string> {
  // Create a new child under "listings"
  const listingsRef = ref(db, 'listings');
  const newRef = push(listingsRef); // generates a new ID

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
