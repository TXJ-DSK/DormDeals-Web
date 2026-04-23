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

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    title: listing.title,
    description: listing.description,
    price: listing.price,
    condition: listing.condition,
    location: listing.location,
    deliveryMethod: listing.deliveryMethod,
    furnitureType: listing.furnitureType,
    image: listing.image,
    sellerContact: listing.sellerContact,
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

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setEditImagePreview(dataUrl);
      setEditData((prev) => ({ ...prev, image: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleImageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
  };

  const handleRemoveImage = () => {
    setEditImagePreview(null);
    setEditData((prev) => ({ ...prev, image: '' }));
  };

  const handleSave = async () => {
    if (!listing.id) return;
    try {
      setIsSaving(true);
      await updateListing(listing.id, editData);
      // Update displayed listing to show new values immediately
      Object.assign(listing, editData);
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
      style={{ zIndex: 10000 }}
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
                <label htmlFor="edit-image" className="form-label">
                  Image
                </label>
                <div
                  style={{
                    width: '100%',
                    height: '200px',
                    border: '2px dashed #d1d5db',
                    borderRadius: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    backgroundColor: '#f9fafb',
                    marginBottom: '0.75rem',
                  }}
                >
                  {editImagePreview || editData.image ? (
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                      }}
                    >
                      <img
                        src={editImagePreview || editData.image}
                        alt="Preview"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '4px',
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        style={{
                          position: 'absolute',
                          top: '0.5rem',
                          right: '0.5rem',
                          background: 'rgba(0,0,0,0.6)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '2rem',
                          height: '2rem',
                          cursor: 'pointer',
                          fontSize: '1.2rem',
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        textAlign: 'center',
                        color: '#9ca3af',
                      }}
                    >
                      <svg
                        width="40"
                        height="40"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{ margin: '0 auto 0.5rem' }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <p style={{ margin: 0, fontSize: '0.9rem' }}>
                        Click to upload image
                      </p>
                    </div>
                  )}
                  <input
                    id="edit-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageInputChange}
                    style={{
                      display: 'none',
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => document.getElementById('edit-image')?.click()}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    background: '#fff',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  Choose Image
                </button>
              </div>
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
              <div className="form-group">
                <label htmlFor="edit-sellerContact" className="form-label">
                  Contact Email
                </label>
                <input
                  id="edit-sellerContact"
                  name="sellerContact"
                  type="email"
                  value={editData.sellerContact}
                  onChange={handleChange}
                  style={inputStyle}
                />
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

              <div className="form-group">
                <div className="form-label">Contact Email</div>
                <p style={{ margin: 0, color: '#374151' }}>{listing.sellerContact}</p>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingDetailsModal;
