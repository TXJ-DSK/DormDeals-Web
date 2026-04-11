import '../styles/ConditionRangeFilter.css';

import React from 'react';

interface ConditionRangeFilterProps {
  minIndex: number;
  maxIndex: number;
  conditions: string[];
  onChange: (minIndex: number, maxIndex: number) => void;
}

const ConditionRangeFilter: React.FC<ConditionRangeFilterProps> = ({
  minIndex,
  maxIndex,
  conditions,
  onChange,
}) => {
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.min(parseInt(e.target.value), maxIndex);
    onChange(newMin, maxIndex);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(parseInt(e.target.value), minIndex);
    onChange(minIndex, newMax);
  };

  const selectedConditions = conditions.slice(minIndex, maxIndex + 1).join(', ');

  return (
    <fieldset className="condition-range-filter">
      <legend className="sort-label">Condition Range:</legend>
      <div className="range-slider-container">
        <div className="range-inputs">
          <input
            type="range"
            min="0"
            max={conditions.length - 1}
            value={minIndex}
            onChange={handleMinChange}
            className="range-input range-input-min"
          />
          <input
            type="range"
            min="0"
            max={conditions.length - 1}
            value={maxIndex}
            onChange={handleMaxChange}
            className="range-input range-input-max"
          />
        </div>
        <div className="range-labels">
          <span className="range-label">{conditions[minIndex]}</span>
          <span className="range-label">{conditions[maxIndex]}</span>
        </div>
        <div className="selected-range">
          <small>{selectedConditions}</small>
        </div>
      </div>
    </fieldset>
  );
};

export default ConditionRangeFilter;
