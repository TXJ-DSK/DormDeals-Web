import React, { useEffect, useState } from 'react';

// Import local assets for build-safe paths
//import logo from '../resources/logo_flat.png';
import logo from '../resources/DormDealsLogo.png';
import { createListing, subscribeToListings } from './api/listing';
import AddListingButton from './components/AddListingButton';
import AddListingForm from './components/AddListingForm';
import ConditionRangeFilter from './components/ConditionRangeFilter';
import ListingCard from './components/ListingCard';
import ListingDetailsModal from './components/ListingDetailsModal';
import LoginPage from './components/LoginPage';
import MapView from './components/MapView';
import SearchBar from './components/SearchBar';
import { FURNITURE_TYPES } from './constants/furnitureTypes';
import { useAuth } from './context/AuthContext';
import { Listing } from './types/Listing';

function App() {
  const { user, loading, logout } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [sortMethod, setSortMethod] = useState<
    'newest' | 'oldest' | 'priceAsc' | 'priceDesc'
  >('newest');

  const [selectedFurnitureTypes, setSelectedFurnitureTypes] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number | string>('');
  const [minConditionIndex, setMinConditionIndex] = useState<number>(0); // New (best)
  const [maxConditionIndex, setMaxConditionIndex] = useState<number>(4); // Poor (worst)

  const [listingsLoading, setListingsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'all' | 'my-furniture' | 'map'>('all');

  const conditions: Array<'New' | 'Like New' | 'Good' | 'Fair' | 'Poor'> = [
    'New',
    'Like New',
    'Good',
    'Fair',
    'Poor',
  ];

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToListings((fresh) => {
      const mapped = fresh.map((listing) => ({
        ...listing,
        createdAt: listing.createdAt ? new Date(listing.createdAt) : new Date(),
      }));
      setListings(mapped);
      setListingsLoading(false);
    });

    return () => {
      unsubscribe();
      setListingsLoading(true);
    };
  }, [user]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="app-container">
        <div className="empty-state">
          <div style={{ marginBottom: '1rem' }}>
            <div
              style={{
                width: '3rem',
                height: '3rem',
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto',
              }}
            />
          </div>
          <h3 className="empty-title">Loading...</h3>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!user) {
    return <LoginPage />;
  }

  const filteredListings = listings
    .filter((listing) => {
      // Filter by user if viewing "my furniture"
      if (currentView === 'my-furniture' && listing.userId !== user?.uid) {
        return false;
      }

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

      const conditionIndex = conditions.indexOf(listing.condition);
      const conditionFilter =
        conditionIndex >= minConditionIndex && conditionIndex <= maxConditionIndex;

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

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedFurnitureTypes([]);
    setMaxPrice('');
    setMinConditionIndex(0);
    setMaxConditionIndex(4);
    setSortMethod('newest');
  };

  const handleAddListing = async (
    newListing: Omit<Listing, 'id' | 'userId' | 'createdAt'>,
  ) => {
    const listing: Listing = {
      ...newListing,
      id: Date.now().toString(),
      userId: user.uid,
      createdAt: new Date(),
    };

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      await createListing({
        ...listing,
        createdAt: listing.createdAt.getTime(),
      });
      setShowAddForm(false); // subscription handles the UI update automatically
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
              marginBottom: '2rem',
            }}
          >
            <button
              onClick={handleResetFilters}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
              }}
              title="Click to reset filters and search"
              aria-label="Reset filters and search"
            >
              <img
                src={logo}
                alt="DormDeals Logo"
                style={{
                  height: '32px',
                  width: 'auto',
                  flexShrink: 0,
                  paddingLeft: '0.5rem',
                }}
              />
            </button>
            <div
              className="search-bar-wrapper"
              style={{
                flex: 1,
                minWidth: '0',
                maxWidth: '400px',
              }}
            >
              <SearchBar onSearch={setSearchQuery} />
            </div>
            {/* user info */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginLeft: 'auto',
                paddingRight: '0.5rem',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: '14px', color: '#fff', fontWeight: 500 }}>
                {user.displayName ?? user.email?.split('@')[0]}
              </span>
              <button
                onClick={logout}
                style={{
                  padding: '0.25rem 0.75rem',
                  fontSize: '13px',
                  color: '#fff',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.5)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Sign out
              </button>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '1rem',
              borderBottom: '2px solid rgba(255,255,255,0.1)',
            }}
          >
            <button
              onClick={() => setCurrentView('all')}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '14px',
                color: currentView === 'all' ? '#fff' : 'rgba(255,255,255,0.7)',
                background: 'transparent',
                border: 'none',
                borderBottom:
                  currentView === 'all' ? '2px solid #3b82f6' : '2px solid transparent',
                cursor: 'pointer',
                fontWeight: currentView === 'all' ? '600' : '400',
                transition: 'all 0.2s',
              }}
            >
              All Listings
            </button>
            <button
              onClick={() => setCurrentView('my-furniture')}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '14px',
                color: currentView === 'my-furniture' ? '#fff' : 'rgba(255,255,255,0.7)',
                background: 'transparent',
                border: 'none',
                borderBottom:
                  currentView === 'my-furniture'
                    ? '2px solid #3b82f6'
                    : '2px solid transparent',
                cursor: 'pointer',
                fontWeight: currentView === 'my-furniture' ? '600' : '400',
                transition: 'all 0.2s',
              }}
            >
              My Furniture
            </button>
            <button
              onClick={() => setCurrentView('map')}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '14px',
                color: currentView === 'map' ? '#fff' : 'rgba(255,255,255,0.7)',
                background: 'transparent',
                border: 'none',
                borderBottom:
                  currentView === 'map' ? '2px solid #3b82f6' : '2px solid transparent',
                cursor: 'pointer',
                fontWeight: currentView === 'map' ? '600' : '400',
                transition: 'all 0.2s',
              }}
            >
              Map View
            </button>
          </div>
          {currentView === 'all' && (
            <div className="control-row">
              <div className="tag-filters">
                <button
                  className={`btn ${selectedFurnitureTypes.length === 0 ? 'active' : ''}`}
                  onClick={() => setSelectedFurnitureTypes([])}
                >
                  All Types
                </button>
                {FURNITURE_TYPES.map((type) => {
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
                    placeholder="Enter max $"
                    className="sort-select"
                    style={{ width: '100px' }}
                  />
                </div>
                <ConditionRangeFilter
                  minIndex={minConditionIndex}
                  maxIndex={maxConditionIndex}
                  conditions={conditions}
                  onChange={(minIdx, maxIdx) => {
                    setMinConditionIndex(minIdx);
                    setMaxConditionIndex(maxIdx);
                  }}
                />
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
          )}
        </div>
      </header>

      <main className="main-content">
        {submitError && (
          <div className="empty-state" style={{ marginBottom: '1rem' }}>
            <h3 className="empty-title">Save Failed</h3>
            <p className="empty-message">{submitError}</p>
          </div>
        )}

        {currentView === 'map' ? (
          <div
            role="region"
            aria-label="Map View"
            data-testid="map-view-container"
            style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}
          >
            <span
              style={{
                position: 'absolute',
                width: '1px',
                height: '1px',
                padding: 0,
                margin: '-1px',
                overflow: 'hidden',
                clip: 'rect(0, 0, 0, 0)',
                whiteSpace: 'nowrap',
                border: 0,
              }}
            >
              Map View active
            </span>
            <MapView listings={listings} onSelectListing={setSelectedListing} />
          </div>
        ) : listingsLoading ? (
          <div className="empty-state">
            <div
              style={{
                width: '2rem',
                height: '2rem',
                border: '3px solid #e5e7eb',
                borderTop: '3px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto',
              }}
            />
          </div>
        ) : filteredListings.length === 0 ? (
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
            <h3 className="empty-title">
              {currentView === 'my-furniture' ? 'No listings yet' : 'No listings found'}
            </h3>
            <p className="empty-message">
              {currentView === 'my-furniture'
                ? 'Click the + button to create more listings!'
                : 'Try adjusting your search or tag filter.'}
            </p>
          </div>
        ) : (
          <div className="grid">
            {filteredListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onClick={() => setSelectedListing(listing)}
              />
            ))}
          </div>
        )}
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </main>

      <AddListingButton onClick={() => setShowAddForm(true)} />

      {showAddForm && (
        <AddListingForm
          onSubmit={handleAddListing}
          onCancel={() => setShowAddForm(false)}
          isSubmitting={isSubmitting}
          furnitureTypes={FURNITURE_TYPES}
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
