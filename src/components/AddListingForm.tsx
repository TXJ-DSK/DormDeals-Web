import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Listing } from '../types/Listing';

interface AddListingFormProps {
  onSubmit: (listing: Omit<Listing, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const RequiredStar = () => (
  <span style={{ color: '#dc2626', marginLeft: '2px' }} aria-hidden="true">
    *
  </span>
);

const AddListingForm: React.FC<AddListingFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    price: 0,
    furnitureType: '',
    condition: 'Good' as const,
    location: '',
    deliveryMethod: 'Both' as const,
    sellerContact: '',
  });

  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      // Cleanup camera stream on unmount
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  const isFieldInvalid = (field: string) => {
    if (!submitAttempted && !touched[field]) return false;
    switch (field) {
      case 'title':
        return !formData.title.trim();
      case 'description':
        return !formData.description.trim();
      case 'furnitureType':
        return !formData.furnitureType.trim();
      case 'location':
        return !formData.location.trim();
      case 'sellerContact':
        return !formData.sellerContact.trim();
      default:
        return false;
    }
  };

  const errorBorder = (field: string) =>
    isFieldInvalid(field) ? '1.5px solid #dc2626' : undefined;

  const handleBlur = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    if (name === 'price') {
      const numValue = Number(value);
      if (value === '') {
        setFormData((prev) => ({ ...prev, [name]: 0 }));
        setPriceError(null);
        return;
      }
      if (isNaN(numValue)) {
        setPriceError('Price must be a valid number');
        return;
      }
      if (numValue < 0 || numValue > 9999) {
        setPriceError('Price must be between $0 and $9999');
        return;
      }
      const decimalPlaces = value.split('.')[1]?.length || 0;
      if (decimalPlaces > 2) {
        setPriceError('Price can have at most 2 decimal places');
        return;
      }
      setPriceError(null);
      setFormData((prev) => ({ ...prev, [name]: numValue }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value,
      }));
    }
  };

  const handleImageFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImagePreview(dataUrl);
      setFormData((prev) => ({ ...prev, image: dataUrl }));
    };
    reader.readAsDataURL(file);
  }, []);

  // 1. Modified startCamera: Just get the stream and open the modal
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      setCameraStream(stream);
      setShowCamera(true);
    } catch (error) {
      console.error('Camera error:', error);
      alert('Camera access denied. Please check your browser settings.');
    }
  }, []);

  // 2. Add this EFFECT: This attaches the stream once the <video> element exists
  useEffect(() => {
    if (showCamera && videoRef.current && cameraStream) {
      const video = videoRef.current;
      video.srcObject = cameraStream;

      const handlePlay = () => {
        video.play().catch((e) => console.error('Video play failed:', e));
      };

      video.addEventListener('loadedmetadata', handlePlay);
      return () => video.removeEventListener('loadedmetadata', handlePlay);
    }
  }, [showCamera, cameraStream]);

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  }, [cameraStream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    // Set canvas to match the VIEWPORT size the user sees
    const displayWidth = video.clientWidth;
    const displayHeight = video.clientHeight;
    canvas.width = displayWidth;
    canvas.height = displayHeight;

    // Match the CSS 'object-fit: cover' cropping
    const videoRatio = video.videoWidth / video.videoHeight;
    const displayRatio = displayWidth / displayHeight;

    let sx = 0,
      sy = 0,
      sw = video.videoWidth,
      sh = video.videoHeight;

    if (videoRatio > displayRatio) {
      sw = video.videoHeight * displayRatio;
      sx = (video.videoWidth - sw) / 2;
    } else {
      sh = video.videoWidth / displayRatio;
      sy = (video.videoHeight - sh) / 2;
    }

    // Draw only the visible portion onto the canvas
    context.drawImage(video, sx, sy, sw, sh, 0, 0, displayWidth, displayHeight);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setImagePreview(dataUrl);
    setFormData((prev) => ({ ...prev, image: dataUrl }));
    stopCamera();
  }, [stopCamera]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageFile(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePriceFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (formData.price === 0) e.currentTarget.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);

    const hasEmptyFields =
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.furnitureType.trim() ||
      !formData.location.trim() ||
      !formData.sellerContact.trim();

    if (hasEmptyFields || priceError || formData.price < 0 || formData.price > 9999) {
      return;
    }

    await onSubmit(formData as Omit<Listing, 'id' | 'userId' | 'createdAt'>);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Add New Listing</h2>
          <button onClick={onCancel} className="modal-close">
            <svg
              style={{ width: '1.5rem', height: '1.5rem' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Title
                <RequiredStar />
              </label>
              <input
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                onBlur={() => handleBlur('title')}
                className="form-input"
                placeholder="e.g., Office Chair with Lumbar Support"
                style={{ border: errorBorder('title') }}
              />
              {isFieldInvalid('title') && (
                <p style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  Title is required
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Description
                <RequiredStar />
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                onBlur={() => handleBlur('description')}
                rows={3}
                className="form-textarea"
                placeholder="Dimensions, color, material, age, etc."
                style={{ border: errorBorder('description') }}
              />
              {isFieldInvalid('description') && (
                <p style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  Description is required
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="image-upload" className="form-label">
                Image{' '}
                <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span>
              </label>
              {imagePreview ? (
                <div
                  style={{ position: 'relative', display: 'inline-block', width: '100%' }}
                >
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      width: '100%',
                      maxHeight: '200px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'rgba(0,0,0,0.6)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      lineHeight: '28px',
                      textAlign: 'center',
                    }}
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div
                  role="button"
                  tabIndex={0}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
                  }}
                  style={{
                    border: `2px dashed ${isDragging ? '#6366f1' : '#d1d5db'}`,
                    borderRadius: '8px',
                    padding: '2rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: isDragging ? '#eef2ff' : '#f9fafb',
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                >
                  <svg
                    width="40"
                    height="40"
                    fill="none"
                    stroke={isDragging ? '#6366f1' : '#9ca3af'}
                    viewBox="0 0 24 24"
                    style={{ margin: '0 auto 0.5rem' }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                    />
                  </svg>
                  <p
                    style={{
                      margin: 0,
                      color: isDragging ? '#6366f1' : '#6b7280',
                      fontWeight: 500,
                    }}
                  >
                    {isDragging
                      ? 'Drop your image here'
                      : 'Drag & drop or click to upload'}
                  </p>
                  <p
                    style={{
                      margin: '0.25rem 0 0',
                      fontSize: '0.75rem',
                      color: '#9ca3af',
                    }}
                  >
                    PNG, JPG, GIF, WEBP
                  </p>
                </div>
              )}
              <button
                type="button"
                onClick={startCamera}
                className="btn btn-secondary"
                style={{ marginTop: '0.5rem', width: '100%' }}
              >
                Take Photo
              </button>
              <input
                id="image-upload"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                style={{ display: 'none' }}
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="price" className="form-label">
                  Price
                  <RequiredStar />
                </label>
                <input
                  id="price"
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  onFocus={handlePriceFocus}
                  className="form-input"
                  min="0"
                  max="9999"
                  step="1"
                  placeholder="0.00"
                />
                {priceError && (
                  <p
                    style={{
                      color: '#dc2626',
                      fontSize: '0.875rem',
                      marginTop: '0.25rem',
                    }}
                  >
                    {priceError}
                  </p>
                )}
                <p
                  style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.25rem' }}
                >
                  $0 – $9999
                </p>
              </div>
              <div className="form-group">
                <label htmlFor="condition" className="form-label">
                  Condition
                  <RequiredStar />
                </label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="New">New</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="furnitureType" className="form-label">
                  Furniture Type
                  <RequiredStar />
                </label>
                <input
                  id="furnitureType"
                  type="text"
                  name="furnitureType"
                  value={formData.furnitureType}
                  onChange={handleChange}
                  onBlur={() => handleBlur('furnitureType')}
                  className="form-input"
                  placeholder="Chair, Desk, Bookshelf..."
                  style={{ border: errorBorder('furnitureType') }}
                />
                {isFieldInvalid('furnitureType') && (
                  <p
                    style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.25rem' }}
                  >
                    Furniture type is required
                  </p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="location" className="form-label">
                  Address
                  <RequiredStar />
                </label>
                <input
                  id="location"
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  onBlur={() => handleBlur('location')}
                  className="form-input"
                  placeholder="e.g., 633 Clark St"
                  style={{ border: errorBorder('location') }}
                />
                {isFieldInvalid('location') && (
                  <p
                    style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.25rem' }}
                  >
                    Location is required
                  </p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="deliveryMethod" className="form-label">
                Delivery Method
                <RequiredStar />
              </label>
              <select
                id="deliveryMethod"
                name="deliveryMethod"
                value={formData.deliveryMethod}
                onChange={handleChange}
                className="form-input"
              >
                <option value="Pickup">Pickup Only</option>
                <option value="Delivery">Delivery Only</option>
                <option value="Both">Pickup or Delivery</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="sellerContact" className="form-label">
                Your Contact Email
                <RequiredStar />
              </label>
              <input
                id="sellerContact"
                type="email"
                name="sellerContact"
                value={formData.sellerContact}
                onChange={handleChange}
                onBlur={() => handleBlur('sellerContact')}
                className="form-input"
                placeholder="your.email@u.northwestern.edu"
                style={{ border: errorBorder('sellerContact') }}
              />
              {isFieldInvalid('sellerContact') && (
                <p style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  Contact email is required
                </p>
              )}
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={onCancel}
                className="btn btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Add Listing'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showCamera && (
        <div className="modal-overlay" style={{ zIndex: 1001 }}>
          <div className="modal" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Take Picture</h2>
              <button onClick={stopCamera} className="modal-close">
                ×
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '350px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  background: '#000',
                }}
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Capture Photo
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AddListingForm;
