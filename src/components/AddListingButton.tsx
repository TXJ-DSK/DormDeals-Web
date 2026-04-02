import React from 'react';

interface AddListingButtonProps {
  onClick: () => void;
}

const AddListingButton: React.FC<AddListingButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="add-button"
      title="Add new listing"
      aria-label="Add a listing"
    >
      <svg
        style={{ width: '2rem', height: '2rem' }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      </svg>
    </button>
  );
};

export default AddListingButton;
