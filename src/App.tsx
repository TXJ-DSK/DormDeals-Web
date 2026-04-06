import React, { useEffect, useState } from 'react';

// Import local assets for build-safe paths
import logo from '../resources/logo_flat.png';
import { createListing, getListings } from './api/listing';
import AddListingButton from './components/AddListingButton';
import AddListingForm from './components/AddListingForm';
import ListingCard from './components/ListingCard';
import ListingDetailsModal from './components/ListingDetailsModal';
import SearchBar from './components/SearchBar';
import { Listing } from './types/Listing';

const mockListings: Listing[] = [
  {
    id: '1',
    title: 'Office Chair with Lumbar Support',
    description:
      'Comfortable office chair in great condition. Adjustable height and lumbar support. Perfect for studying.',
    price: 50,
    image:
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
    furnitureType: 'Chair',
    condition: 'Good',
    location: 'Downtown',
    deliveryMethod: 'Pickup',
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    userId: 'user1',
    sellerContact: 'john@u.northwestern.edu',
  },
  {
    id: '2',
    title: 'Modern Wooden Study Desk',
    description:
      'Sleek wooden desk with drawers for storage. Ideal for dorm rooms. Like new condition.',
    price: 100,
    image:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop',
    furnitureType: 'Desk',
    condition: 'Like New',
    location: 'Campus',
    deliveryMethod: 'Both',
    createdAt: new Date(Date.now() - 172800000), // 2 days ago
    userId: 'user2',
    sellerContact: 'sarah@u.northwestern.edu',
  },
  {
    id: '3',
    title: 'Adjustable Bookshelf',
    description:
      'Wooden bookshelf with adjustable shelves. Good for organizing textbooks and personal items.',
    price: 25,
    image:
      'https://images.unsplash.com/photo-1549497538-303791108f95?w=400&h=300&fit=crop',
    furnitureType: 'Bookshelf',
    condition: 'Fair',
    location: 'Westside',
    deliveryMethod: 'Pickup',
    createdAt: new Date(Date.now() - 259200000), // 3 days ago
    userId: 'user3',
    sellerContact: 'mike@u.northwestern.edu',
  },
  {
    id: '4',
    title: 'Ergonomic Gaming Chair with RGB',
    description:
      'High-back gaming chair with RGB lighting and lumbar support. Barely used, like new.',
    price: 75,
    image:
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
    furnitureType: 'Chair',
    condition: 'New',
    location: 'Eastside',
    deliveryMethod: 'Delivery',
    createdAt: new Date(Date.now() - 345600000), // 4 days ago
    userId: 'user4',
    sellerContact: 'alex@u.northwestern.edu',
  },
  {
    id: '5',
    title: 'Compact Writing Desk',
    description:
      'Perfect small desk for dorm rooms. Saves space while providing a work surface.',
    price: 40,
    image:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop',
    furnitureType: 'Desk',
    condition: 'Good',
    location: 'North Campus',
    deliveryMethod: 'Both',
    createdAt: new Date(Date.now() - 432000000), // 5 days ago
    userId: 'user5',
    sellerContact: 'emma@u.northwestern.edu',
  },
  {
    id: '6',
    title: 'Storage Bookshelf',
    description:
      'Used bookshelf in fair condition. Still very functional for storing items.',
    price: 15,
    image:
      'https://images.unsplash.com/photo-1549497538-303791108f95?w=400&h=300&fit=crop',
    furnitureType: 'Bookshelf',
    condition: 'Poor',
    location: 'Southside',
    deliveryMethod: 'Pickup',
    createdAt: new Date(Date.now() - 518400000), // 6 days ago
    userId: 'user6',
    sellerContact: 'david@u.northwestern.edu',
  },
];

function App() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [sortMethod, setSortMethod] = useState<
    'newest' | 'oldest' | 'priceAsc' | 'priceDesc'
  >('newest');

  const furnitureTypeSet = Array.from(
    new Set(listings.map((listing) => listing.furnitureType)),
  ).sort();
  const [selectedFurnitureTypes, setSelectedFurnitureTypes] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number | string>('');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

  const conditions: Array<'New' | 'Like New' | 'Good' | 'Fair' | 'Poor'> = [
    'New',
    'Like New',
    'Good',
    'Fair',
    'Poor',
  ];

  const loadListings = async () => {
    try {
      const dbListings = await getListings();
      const mappedListings: Listing[] = dbListings.map((listing) => ({
        ...listing,
        id: listing.id ?? Date.now().toString(),
        createdAt: listing.createdAt ? new Date(listing.createdAt) : new Date(),
      }));
      setListings(mappedListings);
    } catch (error) {
      console.error('Failed to load listings from Realtime Database:', error);
      setListings(mockListings);
    }
  };

  useEffect(() => {
    void loadListings();
  }, []);

  const filteredListings = listings
    .filter((listing) => {
      const query = searchQuery.toLowerCase();
      const inText =
        listing.title.toLowerCase().includes(query) ||
        listing.description.toLowerCase().includes(query) ||
        listing.location.toLowerCase().includes(query) ||
        listing.furnitureType.toLowerCase().includes(query);

      const typeFilter =
        selectedFurnitureTypes.length === 0 ||
        selectedFurnitureTypes.includes(listing.furnitureType);

      const priceFilter = !maxPrice || listing.price <= parseFloat(maxPrice as string);

      const conditionFilter =
        selectedConditions.length === 0 || selectedConditions.includes(listing.condition);

      return inText && typeFilter && priceFilter && conditionFilter;
    })
    .slice()
    .sort((a, b) => {
      if (sortMethod === 'newest') return b.createdAt.getTime() - a.createdAt.getTime();
      if (sortMethod === 'oldest') return a.createdAt.getTime() - b.createdAt.getTime();
      if (sortMethod === 'priceAsc') return a.price - b.price;
      if (sortMethod === 'priceDesc') return b.price - a.price;
      return 0;
    });

  const handleAddListing = async (
    newListing: Omit<Listing, 'id' | 'userId' | 'createdAt'>,
  ) => {
    const listing: Listing = {
      ...newListing,
      id: Date.now().toString(),
      userId: 'currentUser',
      createdAt: new Date(),
    };

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      await createListing({
        ...listing,
        createdAt: listing.createdAt.getTime(),
      });

      await loadListings();
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to create listing:', error);
      setSubmitError(
        'Could not save listing. Check Firebase Realtime Database write rules and try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-content">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem',
            }}
          >
            <img
              src={logo}
              alt="DormDeals Logo"
              style={{ height: '40px', width: 'auto', flexShrink: 0 }}
            />
            <div className="search-bar-wrapper" style={{ flex: 1, minWidth: '0' }}>
              <SearchBar onSearch={setSearchQuery} />
            </div>
          </div>
          <div className="control-row">
            <div className="tag-filters">
              <button
                className={`btn ${selectedFurnitureTypes.length === 0 ? 'active' : ''}`}
                onClick={() => setSelectedFurnitureTypes([])}
              >
                All Types
              </button>
              {furnitureTypeSet.map((type) => {
                const isChecked = selectedFurnitureTypes.includes(type);
                return (
                  <button
                    key={type}
                    className={`btn ${isChecked ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedFurnitureTypes((prev) =>
                        prev.includes(type)
                          ? prev.filter((t) => t !== type)
                          : [...prev, type],
                      );
                    }}
                  >
                    {type}
                    {isChecked && ' ✓'}
                  </button>
                );
              })}
            </div>
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <label htmlFor="maxPrice" className="sort-label">
                  Max Price:
                </label>
                <input
                  id="maxPrice"
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Enter max price"
                  className="sort-select"
                  style={{ width: '100px' }}
                />
              </div>
              <div>
                <label htmlFor="condition" className="sort-label">
                  Condition:
                </label>
                <select
                  id="condition"
                  value={selectedConditions.join(',')}
                  onChange={(e) =>
                    setSelectedConditions(e.target.value ? e.target.value.split(',') : [])
                  }
                  className="sort-select"
                >
                  <option value="">All Conditions</option>
                  {conditions.map((cond) => (
                    <option key={cond} value={cond}>
                      {cond}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="sort" className="sort-label">
                  Sort by:
                </label>
                <select
                  id="sort"
                  value={sortMethod}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setSortMethod(
                      e.target.value as 'newest' | 'oldest' | 'priceAsc' | 'priceDesc',
                    )
                  }
                  className="sort-select"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        {submitError && (
          <div className="empty-state" style={{ marginBottom: '1rem' }}>
            <h3 className="empty-title">Save Failed</h3>
            <p className="empty-message">{submitError}</p>
          </div>
        )}

        <div className="grid">
          {filteredListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onClick={() => setSelectedListing(listing)}
            />
          ))}
        </div>
        {filteredListings.length === 0 && (
          <div className="empty-state">
            <svg
              className="empty-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-5v2m0 0v2m0-2h2m-2 0h-2"
              />
            </svg>
            <h3 className="empty-title">No listings found</h3>
            <p className="empty-message">Try adjusting your search or tag filter.</p>
          </div>
        )}
      </main>

      <AddListingButton onClick={() => setShowAddForm(true)} />

      {showAddForm && (
        <AddListingForm
          onSubmit={handleAddListing}
          onCancel={() => setShowAddForm(false)}
          isSubmitting={isSubmitting}
        />
      )}

      {selectedListing && (
        <ListingDetailsModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
        />
      )}
    </div>
  );
}

export default App;
