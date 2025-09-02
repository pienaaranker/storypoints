import React, { useState, useEffect } from 'react';
import './StoryBreakdownWorkshop.css';
import { validateStoryBreakdown, formatValidationResults } from '../../../utils/storyBreakdownValidation';

/**
 * Interactive Story Breakdown Workshop Component
 * Allows users to practice breaking down large stories using multiple decomposition techniques
 * 
 * @param {Object} props - Component props
 * @param {Object} props.story - The story to break down (must have breakdownSuggestions)
 * @param {Function} props.onBreakdownComplete - Callback when breakdown is completed successfully
 * @param {Function} props.onCancel - Callback when user cancels the breakdown
 */
function StoryBreakdownWorkshop({ story, onBreakdownComplete, onCancel }) {
  const [selectedTechnique, setSelectedTechnique] = useState(null);
  const [currentBreakdown, setCurrentBreakdown] = useState(null);
  const [userBreakdown, setUserBreakdown] = useState([]);
  const [validationResults, setValidationResults] = useState(null);
  const [showHints, setShowHints] = useState(false);
  const [workshopStep, setWorkshopStep] = useState('technique-selection'); // technique-selection, breakdown-practice, validation

  // Initialize with first technique if available
  useEffect(() => {
    if (story?.breakdownSuggestions?.length > 0 && !selectedTechnique) {
      setSelectedTechnique(story.breakdownSuggestions[0].technique);
      setCurrentBreakdown(story.breakdownSuggestions[0]);
    }
  }, [story, selectedTechnique]);

  /**
   * Handles technique selection
   */
  const handleTechniqueSelect = (technique) => {
    const breakdown = story.breakdownSuggestions.find(b => b.technique === technique);
    setSelectedTechnique(technique);
    setCurrentBreakdown(breakdown);
    setUserBreakdown([]);
    setValidationResults(null);
    setWorkshopStep('breakdown-practice');
  };

  /**
   * Validates the user's breakdown attempt using the validation utility
   */
  const validateBreakdown = (breakdown) => {
    const rawResults = validateStoryBreakdown(breakdown, story);
    return formatValidationResults(rawResults);
  };

  /**
   * Handles user's breakdown submission
   */
  const handleBreakdownSubmit = () => {
    const validation = validateBreakdown(userBreakdown);
    setValidationResults(validation);
    setWorkshopStep('validation');

    if (validation.isValid && onBreakdownComplete) {
      // Delay completion to show validation results
      setTimeout(() => {
        onBreakdownComplete({
          originalStory: story,
          technique: selectedTechnique,
          breakdown: userBreakdown,
          validation
        });
      }, 2000);
    }
  };

  /**
   * Adds a new story to user's breakdown
   */
  const addStoryToBreakdown = () => {
    const newStory = {
      id: `user-story-${Date.now()}`,
      title: '',
      description: '',
      acceptanceCriteria: [''],
      estimatedPoints: 0
    };
    setUserBreakdown([...userBreakdown, newStory]);
  };

  /**
   * Updates a story in the user's breakdown
   */
  const updateBreakdownStory = (index, field, value) => {
    const updated = [...userBreakdown];
    if (field === 'acceptanceCriteria') {
      updated[index] = { ...updated[index], [field]: value };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setUserBreakdown(updated);
  };

  /**
   * Removes a story from user's breakdown
   */
  const removeStoryFromBreakdown = (index) => {
    const updated = userBreakdown.filter((_, i) => i !== index);
    setUserBreakdown(updated);
  };

  /**
   * Shows the suggested breakdown as a hint
   */
  const toggleHints = () => {
    setShowHints(!showHints);
  };

  /**
   * Resets the workshop to start over
   */
  const resetWorkshop = () => {
    setWorkshopStep('technique-selection');
    setUserBreakdown([]);
    setValidationResults(null);
    setShowHints(false);
  };

  if (!story || !story.breakdownSuggestions || story.breakdownSuggestions.length === 0) {
    return (
      <div className="breakdown-workshop error">
        <h3>Story Breakdown Workshop</h3>
        <p>This story doesn't have breakdown suggestions available.</p>
        <button onClick={onCancel} className="btn btn-secondary">
          Back to Exercise
        </button>
      </div>
    );
  }

  return (
    <div className="breakdown-workshop">
      <div className="workshop-header">
        <h3>Story Breakdown Workshop</h3>
        <div className="workshop-progress">
          <div className={`step ${workshopStep === 'technique-selection' ? 'active' : workshopStep !== 'technique-selection' ? 'completed' : ''}`}>
            1. Choose Technique
          </div>
          <div className={`step ${workshopStep === 'breakdown-practice' ? 'active' : workshopStep === 'validation' ? 'completed' : ''}`}>
            2. Break Down Story
          </div>
          <div className={`step ${workshopStep === 'validation' ? 'active' : ''}`}>
            3. Validate Results
          </div>
        </div>
      </div>

      <div className="original-story">
        <h4>Original Story ({story.correctPoints || 'Unknown'} points)</h4>
        <div className="story-card large">
          <h5>{story.title}</h5>
          <p>{story.description}</p>
          <div className="acceptance-criteria">
            <strong>Acceptance Criteria:</strong>
            <ul>
              {story.acceptanceCriteria.map((criteria, index) => (
                <li key={index}>{criteria}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {workshopStep === 'technique-selection' && (
        <div className="technique-selection">
          <h4>Choose a Breakdown Technique</h4>
          <p>Different techniques help you think about story decomposition in different ways:</p>
          
          <div className="technique-options">
            {story.breakdownSuggestions.map((suggestion) => (
              <div 
                key={suggestion.technique}
                className={`technique-card ${selectedTechnique === suggestion.technique ? 'selected' : ''}`}
                onClick={() => handleTechniqueSelect(suggestion.technique)}
              >
                <h5>{getTechniqueDisplayName(suggestion.technique)}</h5>
                <p>{suggestion.description}</p>
                <div className="benefits">
                  <strong>Benefits:</strong>
                  <ul>
                    {suggestion.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {workshopStep === 'breakdown-practice' && (
        <div className="breakdown-practice">
          <h4>Break Down Using: {getTechniqueDisplayName(selectedTechnique)}</h4>
          <p>{currentBreakdown?.description}</p>

          <div className="practice-area">
            <div className="user-breakdown">
              <div className="breakdown-header">
                <h5>Your Breakdown</h5>
                <div className="breakdown-actions">
                  <button onClick={addStoryToBreakdown} className="btn btn-primary btn-sm">
                    Add Story
                  </button>
                  <button onClick={toggleHints} className="btn btn-secondary btn-sm">
                    {showHints ? 'Hide' : 'Show'} Hints
                  </button>
                </div>
              </div>

              {userBreakdown.length === 0 && (
                <div className="empty-breakdown">
                  <p>Start by adding your first story. Think about how to break down the original story using the {getTechniqueDisplayName(selectedTechnique)} approach.</p>
                </div>
              )}

              {userBreakdown.map((story, index) => (
                <UserStoryEditor
                  key={story.id}
                  story={story}
                  index={index}
                  onUpdate={updateBreakdownStory}
                  onRemove={removeStoryFromBreakdown}
                />
              ))}

              {userBreakdown.length > 0 && (
                <div className="breakdown-summary">
                  <div className="total-points">
                    Total Points: {userBreakdown.reduce((sum, s) => sum + (s.estimatedPoints || 0), 0)}
                  </div>
                  <button onClick={handleBreakdownSubmit} className="btn btn-success">
                    Validate Breakdown
                  </button>
                </div>
              )}
            </div>

            {showHints && (
              <div className="hints-panel">
                <h5>Suggested Breakdown</h5>
                <p>Here's one way to break down this story:</p>
                {currentBreakdown?.resultingStories.map((suggestedStory, index) => (
                  <div key={index} className="suggested-story">
                    <h6>{suggestedStory.title} ({suggestedStory.estimationVariance?.experiencedTeam?.points || '?'} points)</h6>
                    <p>{suggestedStory.description}</p>
                    <ul>
                      {suggestedStory.acceptanceCriteria.map((criteria, cIndex) => (
                        <li key={cIndex}>{criteria}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="workshop-navigation">
            <button onClick={resetWorkshop} className="btn btn-secondary">
              Start Over
            </button>
            <button onClick={onCancel} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}

      {workshopStep === 'validation' && validationResults && (
        <div className="validation-results">
          <h4>Breakdown Validation Results</h4>
          
          <div className={`validation-status ${validationResults.isValid ? 'success' : 'error'}`}>
            {validationResults.isValid ? (
              <div className="success-message">
                <h5>✅ Great job! Your breakdown looks good.</h5>
                <p>All stories are appropriately sized and the breakdown covers the original scope.</p>
              </div>
            ) : (
              <div className="error-message">
                <h5>❌ Your breakdown needs some adjustments</h5>
                <p>Please review the issues below and try again.</p>
              </div>
            )}
          </div>

          {validationResults.errors.length > 0 && (
            <div className="validation-errors">
              <h6>Issues to Fix:</h6>
              <ul>
                {validationResults.errors.map((error, index) => (
                  <li key={index} className="error">{error.message}</li>
                ))}
              </ul>
            </div>
          )}

          {validationResults.warnings.length > 0 && (
            <div className="validation-warnings">
              <h6>Warnings:</h6>
              <ul>
                {validationResults.warnings.map((warning, index) => (
                  <li key={index} className="warning">{warning.message}</li>
                ))}
              </ul>
            </div>
          )}

          {validationResults.suggestions.length > 0 && (
            <div className="validation-suggestions">
              <h6>Insights:</h6>
              <ul>
                {validationResults.suggestions.map((suggestion, index) => (
                  <li key={index} className="suggestion">{suggestion.message}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="validation-actions">
            {!validationResults.isValid && (
              <button 
                onClick={() => setWorkshopStep('breakdown-practice')} 
                className="btn btn-primary"
              >
                Fix Issues
              </button>
            )}
            <button onClick={resetWorkshop} className="btn btn-secondary">
              Try Different Technique
            </button>
            <button onClick={onCancel} className="btn btn-secondary">
              Finish Workshop
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Individual story editor component for user breakdown
 */
function UserStoryEditor({ story, index, onUpdate, onRemove }) {
  const handleCriteriaChange = (criteriaIndex, value) => {
    const updated = [...story.acceptanceCriteria];
    updated[criteriaIndex] = value;
    onUpdate(index, 'acceptanceCriteria', updated);
  };

  const addCriteria = () => {
    const updated = [...story.acceptanceCriteria, ''];
    onUpdate(index, 'acceptanceCriteria', updated);
  };

  const removeCriteria = (criteriaIndex) => {
    const updated = story.acceptanceCriteria.filter((_, i) => i !== criteriaIndex);
    onUpdate(index, 'acceptanceCriteria', updated);
  };

  return (
    <div className="user-story-editor">
      <div className="story-header">
        <input
          type="text"
          placeholder="Story title..."
          value={story.title}
          onChange={(e) => onUpdate(index, 'title', e.target.value)}
          className="story-title-input"
        />
        <div className="story-actions">
          <input
            type="number"
            min="1"
            max="8"
            placeholder="Points"
            value={story.estimatedPoints || ''}
            onChange={(e) => onUpdate(index, 'estimatedPoints', parseInt(e.target.value) || 0)}
            className="points-input"
          />
          <button onClick={() => onRemove(index)} className="btn btn-danger btn-sm">
            Remove
          </button>
        </div>
      </div>

      <textarea
        placeholder="As a [role], I want [feature] so that [benefit]..."
        value={story.description}
        onChange={(e) => onUpdate(index, 'description', e.target.value)}
        className="story-description-input"
        rows="2"
      />

      <div className="acceptance-criteria-editor">
        <label>Acceptance Criteria:</label>
        {story.acceptanceCriteria.map((criteria, criteriaIndex) => (
          <div key={criteriaIndex} className="criteria-row">
            <input
              type="text"
              placeholder="Acceptance criteria..."
              value={criteria}
              onChange={(e) => handleCriteriaChange(criteriaIndex, e.target.value)}
              className="criteria-input"
            />
            {story.acceptanceCriteria.length > 1 && (
              <button 
                onClick={() => removeCriteria(criteriaIndex)} 
                className="btn btn-danger btn-xs"
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button onClick={addCriteria} className="btn btn-secondary btn-sm">
          Add Criteria
        </button>
      </div>
    </div>
  );
}

/**
 * Helper function to get display name for breakdown techniques
 */
function getTechniqueDisplayName(technique) {
  const names = {
    'by-workflow': 'By Workflow Steps',
    'by-data': 'By Data Entities',
    'by-acceptance-criteria': 'By Acceptance Criteria',
    'by-complexity': 'By Complexity Layers'
  };
  return names[technique] || technique;
}

export default StoryBreakdownWorkshop;