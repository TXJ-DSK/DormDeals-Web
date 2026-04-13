import React from 'react';

import { Listing } from '../types/Listing';

interface ListingCardProps {
  listing: Listing;
  onClick?: () => void;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing, onClick }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick) onClick();
  };

  return (
    <div
      className="card"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={onClick ? 0 : -1}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div style={{ position: 'relative' }}>
        {listing.image ? (
          <img
            src={listing.image}
            alt={listing.title}
            loading="lazy"
            className="card-image"
          />
        ) : (
          <div
            className="card-image"
            style={{
              background: '#f3f4f6',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              color: '#9ca3af',
            }}
          >
            <svg
              width="36"
              height="36"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5M21 3.75H3A.75.75 0 002.25 4.5v15"
              />
            </svg>
            <span style={{ fontSize: '13px' }}>No image</span>
          </div>
        )}
        <div className="card-price">${listing.price}</div>
        <div className="card-condition">{listing.condition}</div>
      </div>
      <div className="card-content">
        <h3 className="card-title">{listing.title}</h3>
        <div className="card-location">
          <svg className="location-icon" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
          {listing.location}
        </div>
        <div className="tag-list" style={{ marginBottom: '0.5rem' }}>
          <span
            className="auction-badge"
            style={{ marginRight: 4, backgroundColor: '#e0f2fe', color: '#0369a1' }}
          >
            {listing.furnitureType}
          </span>
          <span
            className="auction-badge"
            style={{ marginRight: 4, backgroundColor: '#fef2f2', color: '#dc2626' }}
          >
            {listing.deliveryMethod}
          </span>
        </div>
        <div className="card-footer">
          <span>{listing.createdAt.toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
