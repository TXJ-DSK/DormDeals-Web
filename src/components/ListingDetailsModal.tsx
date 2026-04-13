import React, { useState } from 'react';

import { deleteListing, updateListing } from '../api/listing';
import { useAuth } from '../context/AuthContext';
import { Listing } from '../types/Listing';

interface ListingDetailsModalProps {
  listing: Listing;
  onClose: () => void;
}

const ListingDetailsModal: React.FC<ListingDetailsModalProps> = ({
  listing,
  onClose,
}) => {
  const { user } = useAuth();
  const isOwner = user?.uid === listing.userId;

  const [showContact, setShowContact] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editData, setEditData] = useState({
    title: listing.title,
    description: listing.description,
    price: listing.price,
    condition: listing.condition,
    location: listing.location,
    deliveryMethod: listing.deliveryMethod,
    furnitureType: listing.furnitureType,
  });

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value,
    }));
  };

  const handleSave = async () => {
    if (!listing.id) return;
    try {
      setIsSaving(true);
      await updateListing(listing.id, editData);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update listing:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!listing.id || !confirm('Are you sure you want to delete this listing?')) return;
    try {
      setIsDeleting(true);
      await deleteListing(listing.id);
      onClose();
    } catch (err) {
      console.error('Failed to delete listing:', err);
      setIsDeleting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.95rem',
    boxSizing: 'border-box',
  };

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
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
            {isEditing ? 'Edit Listing' : listing.title}
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {listing.image ? (
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
          ) : (
            <div
              style={{
                width: '100%',
                height: '250px',
                background: '#f3f4f6',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                color: '#9ca3af',
              }}
            >
              <svg
                width="48"
                height="48"
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
              <span style={{ fontSize: '14px' }}>No image provided</span>
            </div>
          )}

          {isEditing ? (
            <>
              <div className="form-group">
                <label htmlFor="edit-title" className="form-label">
                  Title
                </label>
                <input
                  name="title"
                  value={editData.title}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-description" className="form-label">
                  Description
                </label>
                <textarea
                  name="description"
                  value={editData.description}
                  onChange={handleChange}
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-price" className="form-label">
                  Price
                </label>
                <input
                  name="price"
                  type="number"
                  value={editData.price}
                  onChange={handleChange}
                  style={inputStyle}
                  min={0}
                  max={9999}
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-condition" className="form-label">
                  Condition
                </label>
                <select
                  name="condition"
                  value={editData.condition}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  {['New', 'Like New', 'Good', 'Fair', 'Poor'].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="edit-furnitureType" className="form-label">
                  Furniture Type
                </label>
                <input
                  name="furnitureType"
                  value={editData.furnitureType}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-location" className="form-label">
                  Location
                </label>
                <input
                  name="location"
                  value={editData.location}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-deliveryMethod" className="form-label">
                  Delivery Method
                </label>
                <select
                  name="deliveryMethod"
                  value={editData.deliveryMethod}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="Pickup">Pickup Only</option>
                  <option value="Delivery">Delivery Only</option>
                  <option value="Both">Pickup or Delivery</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #d1d5db',
                    background: '#fff',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    background: '#4E2A84',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </>
          ) : (
            <>
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
                    backgroundColor: 'rgb(49,49,49)',
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

              {/* Owner actions */}
              {isOwner && (
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #4E2A84',
                      background: '#fff',
                      color: '#4E2A84',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    Edit Listing
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      background: '#dc2626',
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Listing'}
                  </button>
                </div>
              )}

              {/* Message seller — hidden for owner */}
              {!isOwner && (
                <div className="form-group">
                  <button
                    onClick={() => setShowContact(true)}
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
              )}

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
                  <p
                    style={{
                      margin: '0 0 0.5rem 0',
                      fontWeight: '600',
                      color: '#1e40af',
                    }}
                  >
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingDetailsModal;
