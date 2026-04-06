import React, { useState } from 'react';

import { Listing } from '../types/Listing';

interface ListingDetailsModalProps {
  listing: Listing;
  onClose: () => void;
}

const ListingDetailsModal: React.FC<ListingDetailsModalProps> = ({
  listing,
  onClose,
}) => {
  const [showContact, setShowContact] = useState(false);

  const handleMessageSeller = () => {
    setShowContact(true);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    // Only close if clicking directly on the overlay, not on the modal
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleOverlayKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleCloseKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onClose();
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      onKeyDown={handleOverlayKeyDown}
      role="presentation"
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <h2 className="modal-title" id="modal-title">
            {listing.title}
          </h2>
          <button
            className="modal-close"
            onClick={onClose}
            onKeyDown={handleCloseKeyDown}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        <div className="modal-body">
          <img
            src={listing.image}
            alt={listing.title}
            style={{
              width: '100%',
              height: '250px',
              objectFit: 'cover',
              borderRadius: '8px',
              marginBottom: '1.5rem',
            }}
          />

          <div className="form-group">
            <div className="form-label">Description</div>
            <p style={{ margin: 0, color: '#374151', lineHeight: '1.5' }}>
              {listing.description}
            </p>
          </div>

          <div className="form-group">
            <div className="form-label">Price</div>
            <p
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: 'black',
                margin: 0,
              }}
            >
              ${listing.price}
            </p>
          </div>

          <div className="form-group">
            <div className="form-label">Condition</div>
            <span
              style={{
                display: 'inline-block',
                backgroundColor: 'rgb(49, 49, 49)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: '500',
              }}
            >
              {listing.condition}
            </span>
          </div>

          <div className="form-group">
            <div className="form-label">Furniture Type</div>
            <p style={{ margin: 0, color: '#374151' }}>{listing.furnitureType}</p>
          </div>

          <div className="form-group">
            <div className="form-label">Location</div>
            <p style={{ margin: 0, color: '#374151' }}>{listing.location}</p>
          </div>

          <div className="form-group">
            <div className="form-label">Delivery Method</div>
            <span
              style={{
                display: 'inline-block',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                padding: '0.5rem 1rem',
                borderRadius: '0.25rem',
                fontSize: '0.875rem',
                fontWeight: '500',
              }}
            >
              {listing.deliveryMethod}
            </span>
          </div>

          <div className="form-group">
            <div className="form-label">Posted</div>
            <p style={{ margin: 0, color: '#6b7280' }}>
              {listing.createdAt.toLocaleDateString()}
            </p>
          </div>

          <div className="form-group">
            <button
              onClick={handleMessageSeller}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: '#4E2A84',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              Message Seller
            </button>
          </div>

          {showContact && (
            <div
              style={{
                backgroundColor: '#f0f9ff',
                border: '1px solid #bfdbfe',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginTop: '1rem',
              }}
            >
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600', color: '#1e40af' }}>
                Seller Contact:
              </p>
              <p style={{ margin: 0, color: '#0c4a6e', fontSize: '0.95rem' }}>
                <a
                  href={`mailto:${listing.sellerContact}`}
                  style={{ color: '#0369a1', textDecoration: 'underline' }}
                >
                  {listing.sellerContact}
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingDetailsModal;
