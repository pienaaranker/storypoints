import React, { useState, useEffect } from 'react';
import StoryBreakdownWorkshop from './StoryBreakdownWorkshop';
import './Exercise.css';
import './Exercise5.css';

/**
 * Exercise 5: Story Breakdown Workshop
 * Interactive workshop for practicing story decomposition techniques
 */
const Exercise5 = ({ onComplete = () => {} }) => {
  const [breakdownStories, setBreakdownStories] = useState([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [completedBreakdowns, setCompletedBreakdowns] = useState([]);
  const [showWorkshop, setShowWorkshop] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBreakdownStories();
  }, []);

  const loadBreakdownStories = async () => {
    try {
      const response = await fetch('/src/data/modules/story-points/breakdown-required-stories.json');
      const data = await response.json();
      setBreakdownStories(data.stories || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load breakdown stories:', error);
      setLoading(false);
    }
  };

  const handleStartWorkshop = (storyIndex) => {
    setCurrentStoryIndex(storyIndex);
    setShowWorkshop(true);
  };

  const handleBreakdownComplete = (breakdownResult) => {
    const newCompletion = {
      storyIndex: currentStoryIndex,
      story: breakdownStories[currentStoryIndex],
      ...breakdownResult,
      completedAt: new Date().toISOString()
    };

    setCompletedBreakdowns(prev => [...prev, newCompletion]);
    setShowWorkshop(false);

    // Check if all stories are completed
    if (completedBreakdowns.length + 1 >= breakdownStories.length) {
      setShowResults(true);
      onComplete({
        exerciseId: 5,
        completed: true,
        score: calculateOverallScore([...completedBreakdowns, newCompletion]),
        breakdowns: [...completedBreakdowns, newCompletion]
      });
    }
  };

  const handleWorkshopCancel = () => {
    setShowWorkshop(false);
  };

  const calculateOverallScore = (breakdowns) => {
    if (breakdowns.length === 0) return 0;
    
    const totalQuality = breakdowns.reduce((sum, breakdown) => {
      return sum + (breakdown.validation?.qualityScore || 0);
    }, 0);
    
    return Math.round(totalQuality / breakdowns.length);
  };

  const resetExercise = () => {
    setCurrentStoryIndex(0);
    setCompletedBreakdowns([]);
    setShowWorkshop(false);
    setShowResults(false);
  };

  if (loading) {
    return (
      <div className="exercise-container">
        <div className="loading-state">
          <h3>Loading Story Breakdown Workshop...</h3>
          <p>Preparing stories that need decomposition.</p>
        </div>
      </div>
    );
  }

  if (!breakdownStories || breakdownStories.length === 0) {
    return (
      <div className="exercise-container">
        <div className="error-state">
          <h3>No Stories Available</h3>
          <p>Unable to load stories for breakdown practice.</p>
          <button onClick={loadBreakdownStories}>Retry</button>
        </div>
      </div>
    );
  }

  if (showWorkshop) {
    return (
      <div className="exercise-container">
        <StoryBreakdownWorkshop
          story={breakdownStories[currentStoryIndex]}
          onBreakdownComplete={handleBreakdownComplete}
          onCancel={handleWorkshopCancel}
        />
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="exercise-container">
        <div className="exercise-header">
          <h2>Story Breakdown Workshop - Results</h2>
          <p>Great job! You've completed the story breakdown workshop.</p>
        </div>

        <div className="results-summary">
          <div className="summary-stats">
            <div className="stat-card">
              <h4>Stories Broken Down</h4>
              <span className="stat-value">{completedBreakdowns.length}</span>
            </div>
            <div className="stat-card">
              <h4>Average Quality Score</h4>
              <span className="stat-value">{calculateOverallScore(completedBreakdowns)}%</span>
            </div>
            <div className="stat-card">
              <h4>Techniques Used</h4>
              <span className="stat-value">
                {[...new Set(completedBreakdowns.map(b => b.technique))].length}
              </span>
            </div>
          </div>
        </div>

        <div className="breakdown-results">
          <h3>Your Breakdown Results</h3>
          {completedBreakdowns.map((breakdown, index) => (
            <div key={index} className="breakdown-result-card">
              <div className="result-header">
                <h4>{breakdown.story.title}</h4>
                <div className="technique-badge">
                  {getTechniqueDisplayName(breakdown.technique)}
                </div>
                <div className={`quality-score ${getQualityClass(breakdown.validation?.qualityScore || 0)}`}>
                  {breakdown.validation?.qualityScore || 0}%
                </div>
              </div>
              
              <div className="breakdown-summary">
                <p><strong>Original Story:</strong> {breakdown.story.correctPoints || '?'} points</p>
                <p><strong>Your Breakdown:</strong> {breakdown.breakdown.length} stories, {breakdown.breakdown.reduce((sum, s) => sum + (s.estimatedPoints || 0), 0)} total points</p>
              </div>

              <div className="resulting-stories">
                <h5>Resulting Stories:</h5>
                <div className="story-grid">
                  {breakdown.breakdown.map((story, storyIndex) => (
                    <div key={storyIndex} className="mini-story-card">
                      <h6>{story.title} ({story.estimatedPoints || 0} pts)</h6>
                      <p>{story.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {breakdown.validation?.summary && (
                <div className="validation-summary">
                  <div className={`validation-status ${breakdown.validation.summary.isPassable ? 'success' : 'warning'}`}>
                    {breakdown.validation.summary.isPassable ? '✅ Good breakdown!' : '⚠️ Could be improved'}
                  </div>
                  {breakdown.validation.summary.criticalIssues > 0 && (
                    <p className="critical-issues">
                      {breakdown.validation.summary.criticalIssues} critical issue(s) to address
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="key-learnings">
          <h3>Key Learnings from Story Breakdown</h3>
          <div className="learning-grid">
            <div className="learning-card">
              <h4>🎯 Right-Sized Stories</h4>
              <p>Stories should be 1-8 points. Larger stories need breakdown to reduce risk and enable faster delivery.</p>
            </div>
            <div className="learning-card">
              <h4>🔧 Multiple Techniques</h4>
              <p>Different breakdown techniques (workflow, data, criteria, complexity) reveal different decomposition opportunities.</p>
            </div>
            <div className="learning-card">
              <h4>💡 Hidden Complexity</h4>
              <p>Breaking down stories often reveals hidden complexity, dependencies, and edge cases.</p>
            </div>
            <div className="learning-card">
              <h4>🚀 Incremental Value</h4>
              <p>Well-broken-down stories deliver independent value and enable incremental progress.</p>
            </div>
          </div>
        </div>

        <div className="navigation-buttons">
          <button className="complete-exercise-button" onClick={() => onComplete({ exerciseId: 5, completed: true })}>
            Complete Exercise
          </button>
          <button className="reset-button" onClick={resetExercise}>
            Practice Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="exercise-container">
      <div className="exercise-header">
        <h2>Exercise 5: Story Breakdown Workshop</h2>
        <p className="exercise-description">
          Practice breaking down large stories using different decomposition techniques. 
          Learn when and how to split stories to make them more manageable and deliverable.
        </p>
      </div>

      <div className="breakdown-introduction">
        <div className="intro-content">
          <h3>Why Break Down Stories?</h3>
          <div className="benefits-grid">
            <div className="benefit-card">
              <h4>🎯 Reduce Risk</h4>
              <p>Smaller stories are easier to estimate accurately and less likely to encounter unexpected issues.</p>
            </div>
            <div className="benefit-card">
              <h4>🚀 Faster Delivery</h4>
              <p>Smaller stories can be completed and delivered more quickly, providing faster feedback.</p>
            </div>
            <div className="benefit-card">
              <h4>🔍 Better Understanding</h4>
              <p>Breaking down stories forces deeper analysis and reveals hidden requirements.</p>
            </div>
            <div className="benefit-card">
              <h4>🤝 Team Collaboration</h4>
              <p>Smaller stories are easier for team members to work on in parallel.</p>
            </div>
          </div>
        </div>

        <div className="technique-overview">
          <h3>Breakdown Techniques You'll Practice</h3>
          <div className="technique-cards">
            <div className="technique-card">
              <h4>By Workflow Steps</h4>
              <p>Break down by user journey or process steps</p>
            </div>
            <div className="technique-card">
              <h4>By Data Entities</h4>
              <p>Separate by different data objects or entities</p>
            </div>
            <div className="technique-card">
              <h4>By Acceptance Criteria</h4>
              <p>Split based on individual acceptance criteria</p>
            </div>
            <div className="technique-card">
              <h4>By Complexity Layers</h4>
              <p>Separate simple from complex functionality</p>
            </div>
          </div>
        </div>
      </div>

      <div className="stories-to-breakdown">
        <h3>Stories That Need Breakdown</h3>
        <p>These stories are larger than 8 points and should be broken down. Choose one to start practicing:</p>
        
        <div className="story-selection">
          {breakdownStories.map((story, index) => {
            const isCompleted = completedBreakdowns.some(c => c.storyIndex === index);
            
            return (
              <div key={story.id} className={`story-selection-card ${isCompleted ? 'completed' : ''}`}>
                <div className="story-header">
                  <h4>{story.title}</h4>
                  <div className="story-points">
                    {story.correctPoints || '?'} points
                  </div>
                  {isCompleted && <div className="completed-badge">✅ Completed</div>}
                </div>
                
                <p className="story-description">{story.description}</p>
                
                <div className="story-details">
                  <div className="acceptance-criteria-preview">
                    <strong>Acceptance Criteria ({story.acceptanceCriteria?.length || 0}):</strong>
                    <ul>
                      {(story.acceptanceCriteria || []).slice(0, 3).map((criteria, criteriaIndex) => (
                        <li key={criteriaIndex}>{criteria}</li>
                      ))}
                      {story.acceptanceCriteria?.length > 3 && (
                        <li>... and {story.acceptanceCriteria.length - 3} more</li>
                      )}
                    </ul>
                  </div>
                  
                  <div className="breakdown-techniques-available">
                    <strong>Available Techniques:</strong>
                    <div className="technique-tags">
                      {(story.breakdownSuggestions || []).map((suggestion, suggestionIndex) => (
                        <span key={suggestionIndex} className="technique-tag">
                          {getTechniqueDisplayName(suggestion.technique)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="story-actions">
                  <button 
                    className="start-breakdown-button"
                    onClick={() => handleStartWorkshop(index)}
                    disabled={isCompleted}
                  >
                    {isCompleted ? 'Completed' : 'Start Breakdown'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {completedBreakdowns.length > 0 && (
        <div className="progress-section">
          <h3>Your Progress</h3>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(completedBreakdowns.length / breakdownStories.length) * 100}%` }}
            ></div>
          </div>
          <p>{completedBreakdowns.length} of {breakdownStories.length} stories completed</p>
        </div>
      )}
    </div>
  );
};

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

/**
 * Helper function to get CSS class for quality score
 */
function getQualityClass(score) {
  if (score >= 90) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'fair';
  return 'poor';
}

export default Exercise5;