import React from 'react'
import './PointSelector.css'

const DEFAULT_POINT_VALUES = [1, 2, 3, 5, 8, 13]

function PointSelector({ value, onChange, label = "Points:", pointScale = DEFAULT_POINT_VALUES }) {
  const handleCardClick = (pointValue) => {
    // Toggle behavior: if clicking the same value, deselect it
    if (value === pointValue) {
      onChange(null)
    } else {
      onChange(pointValue)
    }
  }

  const handleKeyDown = (event, pointValue) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleCardClick(pointValue)
    }
  }

  return (
    <div className="point-selector">
      <label className="point-selector-label">{label}</label>
      <div className="point-cards" role="radiogroup" aria-label="Story point values">
        {pointScale.map((pointValue) => (
          <button
            key={pointValue}
            type="button"
            className={`point-card ${value === pointValue ? 'selected' : ''}`}
            onClick={() => handleCardClick(pointValue)}
            onKeyDown={(e) => handleKeyDown(e, pointValue)}
            role="radio"
            aria-checked={value === pointValue}
            aria-label={`${pointValue} story points`}
            tabIndex={0}
          >
            {pointValue}
          </button>
        ))}
      </div>
    </div>
  )
}

export default PointSelector
