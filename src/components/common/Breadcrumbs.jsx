import React from 'react'
import './Breadcrumbs.css'

/**
 * Breadcrumbs component for hierarchical navigation
 * @param {Object} props - Component props
 * @param {Array} props.breadcrumbs - Array of breadcrumb objects
 * @param {Function} props.onNavigate - Navigation callback function
 * @param {string} props.separator - Separator character/element
 */
function Breadcrumbs({ breadcrumbs = [], onNavigate, separator = '›' }) {
  /**
   * Handles breadcrumb click
   * @param {Object} breadcrumb - Breadcrumb object
   * @param {Event} event - Click event
   */
  const handleBreadcrumbClick = (breadcrumb, event) => {
    event.preventDefault()
    
    if (!breadcrumb.current && onNavigate) {
      if (breadcrumb.path === 'home') {
        onNavigate('home')
      } else if (breadcrumb.path.startsWith('module:')) {
        const moduleId = breadcrumb.path.split(':')[1]
        onNavigate('module', moduleId)
      } else if (breadcrumb.path.startsWith('exercise:')) {
        const [, moduleId, exerciseId] = breadcrumb.path.split(':')
        onNavigate('exercise', moduleId, parseInt(exerciseId))
      }
    }
  }

  /**
   * Handles keyboard navigation
   * @param {Object} breadcrumb - Breadcrumb object
   * @param {KeyboardEvent} event - Keyboard event
   */
  const handleKeyDown = (breadcrumb, event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      handleBreadcrumbClick(breadcrumb, event)
    }
  }

  if (breadcrumbs.length <= 1) {
    return null
  }

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb navigation">
      <ol className="breadcrumb-list">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={index} className="breadcrumb-item">
            {breadcrumb.current ? (
              <span 
                className="breadcrumb-current"
                aria-current="page"
              >
                {breadcrumb.icon && (
                  <span className="breadcrumb-icon" aria-hidden="true">
                    {breadcrumb.icon}
                  </span>
                )}
                {breadcrumb.label}
              </span>
            ) : (
              <button
                className="breadcrumb-link"
                onClick={(e) => handleBreadcrumbClick(breadcrumb, e)}
                onKeyDown={(e) => handleKeyDown(breadcrumb, e)}
                aria-label={`Navigate to ${breadcrumb.label}`}
              >
                {breadcrumb.icon && (
                  <span className="breadcrumb-icon" aria-hidden="true">
                    {breadcrumb.icon}
                  </span>
                )}
                {breadcrumb.label}
              </button>
            )}
            
            {index < breadcrumbs.length - 1 && (
              <span className="breadcrumb-separator" aria-hidden="true">
                {separator}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default Breadcrumbs
