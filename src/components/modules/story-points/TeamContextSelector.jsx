import React, { useState, useEffect } from 'react';
import './TeamContextSelector.css';

/**
 * TeamContextSelector component for switching between different team scenarios
 * Shows how team experience and context affects story point estimation
 */
const TeamContextSelector = ({
  teamContexts = [],
  selectedContext = null,
  onContextChange,
  estimationVariance = {},
  currentStory = null,
  showVarianceComparison = true,
  className = ''
}) => {
  const [activeContext, setActiveContext] = useState(selectedContext);

  useEffect(() => {
    setActiveContext(selectedContext);
  }, [selectedContext]);

  const handleContextSelect = (context) => {
    setActiveContext(context);
    if (onContextChange) {
      onContextChange(context);
    }
  };

  const getExperienceIcon = (level) => {
    switch (level) {
      case 'junior': return '🌱';
      case 'intermediate': return '🌿';
      case 'senior': return '🌳';
      default: return '👥';
    }
  };

  const getConfidenceColor = (level) => {
    switch (level) {
      case 'low': return '#ff6b6b';
      case 'medium': return '#ffd93d';
      case 'high': return '#6bcf7f';
      default: return '#666';
    }
  };

  const renderTeamCard = (context) => {
    const isActive = activeContext?.id === context.id;
    const variance = estimationVariance[context.id];
    
    return (
      <div
        key={context.id}
        className={`team-context-card ${isActive ? 'active' : ''}`}
        onClick={() => handleContextSelect(context)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleContextSelect(context);
          }
        }}
        aria-pressed={isActive}
        aria-label={`Select ${context.name} team context`}
      >
        <div className="team-header">
          <span className="team-icon">{getExperienceIcon(context.experienceLevel)}</span>
          <h3 className="team-name">{context.name}</h3>
        </div>
        
        <div className="team-details">
          <div className="team-stats">
            <span className="stat">
              <strong>Experience:</strong> {context.experienceLevel}
            </span>
            <span className="stat">
              <strong>Domain:</strong> {context.domainKnowledge}
            </span>
            <span className="stat">
              <strong>Tech Stack:</strong> {context.technicalStack}
            </span>
            <span className="stat">
              <strong>Team Size:</strong> {context.teamSize}
            </span>
          </div>
          
          {variance && showVarianceComparison && (
            <div className="estimation-variance">
              <div className="points-estimate">
                <span className="points">{variance.points}</span>
                <span className="points-label">story points</span>
              </div>
              <div 
                className="confidence-indicator"
                style={{ backgroundColor: getConfidenceColor(variance.confidenceLevel) }}
                title={`Confidence: ${variance.confidenceLevel}`}
              >
                {variance.confidenceLevel}
              </div>
            </div>
          )}
        </div>
        
        <div className="team-characteristics">
          {context.characteristics?.slice(0, 2).map((characteristic, index) => (
            <span key={index} className="characteristic-tag">
              {characteristic}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderVarianceExplanation = () => {
    if (!showVarianceComparison || !currentStory || Object.keys(estimationVariance).length < 2) {
      return null;
    }

    const sortedVariances = Object.entries(estimationVariance)
      .sort(([, a], [, b]) => a.points - b.points);

    return (
      <div className="variance-explanation">
        <h4>Why Estimates Vary by Team</h4>
        <div className="variance-comparison">
          {sortedVariances.map(([teamId, variance]) => {
            const context = teamContexts.find(c => c.id === teamId);
            if (!context) return null;

            return (
              <div key={teamId} className="variance-item">
                <div className="variance-header">
                  <span className="team-name">{context.name}</span>
                  <span className="points-badge">{variance.points} pts</span>
                </div>
                <p className="variance-reasoning">{variance.reasoning}</p>
                {variance.riskFactors && variance.riskFactors.length > 0 && (
                  <div className="risk-factors">
                    <strong>Risk Factors:</strong>
                    <ul>
                      {variance.riskFactors.map((risk, index) => (
                        <li key={index}>{risk}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="key-learning">
          <h5>Key Learning</h5>
          <p>
            The same story can have dramatically different estimates based on team experience, 
            domain knowledge, and familiarity with the technology stack. This is why comparing 
            velocity between teams is meaningless - each team's context is unique.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className={`team-context-selector ${className}`}>
      <div className="selector-header">
        <h3>Team Context</h3>
        <p>Select a team to see how their experience affects story estimation</p>
      </div>
      
      <div className="team-contexts-grid">
        {teamContexts.map(renderTeamCard)}
      </div>
      
      {activeContext && (
        <div className="selected-context-details">
          <h4>Selected Team: {activeContext.name}</h4>
          <div className="working-agreements">
            <strong>Working Agreements:</strong>
            <ul>
              {activeContext.workingAgreements?.map((agreement, index) => (
                <li key={index}>{agreement}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {renderVarianceExplanation()}
    </div>
  );
};

export default TeamContextSelector;