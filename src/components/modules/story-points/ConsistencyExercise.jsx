import React, { useState, useEffect } from 'react';
import ConsistencyFeedback from './ConsistencyFeedback.jsx';
import crossDomainData from '../../../data/modules/story-points/cross-domain-consistency-examples.json';
import './ConsistencyExercise.css';

/**
 * Interactive exercise for learning story point consistency validation
 */
const ConsistencyExercise = ({ onComplete = () => {} }) => {
  const [currentPhase, setCurrentPhase] = useState('introduction');
  const [userEstimates, setUserEstimates] = useState({});
  const [selectedStories, setSelectedStories] = useState([]);
  const [consistencyData, setConsistencyData] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [completedPhases, setCompletedPhases] = useState(new Set());

  const { technicalStories, businessStories, consistencyScenarios } = crossDomainData.crossDomainExamples;

  useEffect(() => {
    // Update selected stories when estimates change
    const storiesWithEstimates = [...technicalStories, ...businessStories]
      .filter(story => userEstimates[story.id])
      .map(story => ({
        ...story,
        points: userEstimates[story.id]
      }));
    
    setSelectedStories(storiesWithEstimates);
  }, [userEstimates, technicalStories, businessStories]);

  const handleEstimateChange = (storyId, points) => {
    setUserEstimates(prev => ({
      ...prev,
      [storyId]: parseInt(points) || 0
    }));
  };

  const handleConsistencyChange = (data) => {
    setConsistencyData(data);
  };

  const proceedToNextPhase = () => {
    setCompletedPhases(prev => new Set([...prev, currentPhase]));
    
    const phases = ['introduction', 'basic-estimation', 'cross-domain', 'advanced-scenarios', 'summary'];
    const currentIndex = phases.indexOf(currentPhase);
    
    if (currentIndex < phases.length - 1) {
      setCurrentPhase(phases[currentIndex + 1]);
      setShowFeedback(false);
    } else {
      onComplete({
        completedPhases: Array.from(completedPhases),
        finalConsistency: consistencyData,
        userEstimates
      });
    }
  };

  const renderIntroduction = () => (
    <div className="exercise-phase">
      <h2>Story Point Consistency Exercise</h2>
      <div className="introduction-content">
        <p>
          In this exercise, you'll learn how to maintain consistency in story point estimation 
          across different types of stories and team contexts.
        </p>
        
        <div className="learning-objectives">
          <h3>Learning Objectives</h3>
          <ul>
            <li>Understand relative sizing consistency principles</li>
            <li>Practice cross-domain estimation (technical vs business stories)</li>
            <li>Learn to identify and correct estimation inconsistencies</li>
            <li>Use real-time feedback to improve estimation accuracy</li>
          </ul>
        </div>

        <div className="consistency-principles">
          <h3>Key Principles</h3>
          <div className="principle-card">
            <h4>Relative Sizing</h4>
            <p>Story points represent relative complexity, not absolute time or effort.</p>
          </div>
          <div className="principle-card">
            <h4>Cross-Domain Consistency</h4>
            <p>Use the same scale and approach for technical and business stories.</p>
          </div>
          <div className="principle-card">
            <h4>Team Context Matters</h4>
            <p>The same story may have different points for different teams based on their capabilities.</p>
          </div>
        </div>

        <button className="proceed-button" onClick={proceedToNextPhase}>
          Start Exercise
        </button>
      </div>
    </div>
  );

  const renderBasicEstimation = () => (
    <div className="exercise-phase">
      <h2>Phase 1: Basic Estimation Practice</h2>
      <p>
        Estimate the following stories. Pay attention to their complexity factors and 
        try to maintain relative consistency.
      </p>

      <div className="stories-grid">
        {technicalStories.slice(0, 3).map(story => (
          <div key={story.id} className="story-card">
            <h3>{story.title}</h3>
            <p>{story.description}</p>
            
            <div className="complexity-display">
              <h4>Complexity Factors:</h4>
              <div className="complexity-factors">
                {Object.entries(story.complexityFactors).map(([factor, level]) => (
                  <span key={factor} className={`complexity-tag ${level}`}>
                    {factor}: {level}
                  </span>
                ))}
              </div>
            </div>

            <div className="acceptance-criteria">
              <h4>Acceptance Criteria:</h4>
              <ul>
                {story.acceptanceCriteria.map((criteria, index) => (
                  <li key={index}>{criteria}</li>
                ))}
              </ul>
            </div>

            <div className="estimation-input">
              <label htmlFor={`estimate-${story.id}`}>Your Estimate:</label>
              <select
                id={`estimate-${story.id}`}
                value={userEstimates[story.id] || ''}
                onChange={(e) => handleEstimateChange(story.id, e.target.value)}
              >
                <option value="">Select points...</option>
                {[1, 2, 3, 5, 8, 13, 21].map(points => (
                  <option key={points} value={points}>{points}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      {selectedStories.length >= 2 && (
        <div className="feedback-section">
          <button 
            className="show-feedback-button"
            onClick={() => setShowFeedback(!showFeedback)}
          >
            {showFeedback ? 'Hide' : 'Show'} Consistency Analysis
          </button>
          
          {showFeedback && (
            <ConsistencyFeedback
              stories={selectedStories}
              onConsistencyChange={handleConsistencyChange}
            />
          )}
        </div>
      )}

      {selectedStories.length >= 3 && (
        <button className="proceed-button" onClick={proceedToNextPhase}>
          Continue to Cross-Domain Exercise
        </button>
      )}
    </div>
  );

  const renderCrossDomainExercise = () => (
    <div className="exercise-phase">
      <h2>Phase 2: Cross-Domain Consistency</h2>
      <p>
        Now estimate both technical and business stories. Focus on maintaining 
        consistency across different story types.
      </p>

      <div className="domain-sections">
        <div className="domain-section">
          <h3>Technical Stories</h3>
          {technicalStories.slice(0, 2).map(story => (
            <div key={story.id} className="story-card technical">
              <h4>{story.title}</h4>
              <p>{story.description}</p>
              
              <div className="estimation-input">
                <label htmlFor={`estimate-${story.id}`}>Points:</label>
                <select
                  id={`estimate-${story.id}`}
                  value={userEstimates[story.id] || ''}
                  onChange={(e) => handleEstimateChange(story.id, e.target.value)}
                >
                  <option value="">Select...</option>
                  {[1, 2, 3, 5, 8, 13].map(points => (
                    <option key={points} value={points}>{points}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>

        <div className="domain-section">
          <h3>Business Stories</h3>
          {businessStories.slice(0, 2).map(story => (
            <div key={story.id} className="story-card business">
              <h4>{story.title}</h4>
              <p>{story.description}</p>
              
              <div className="estimation-input">
                <label htmlFor={`estimate-${story.id}`}>Points:</label>
                <select
                  id={`estimate-${story.id}`}
                  value={userEstimates[story.id] || ''}
                  onChange={(e) => handleEstimateChange(story.id, e.target.value)}
                >
                  <option value="">Select...</option>
                  {[1, 2, 3, 5, 8, 13].map(points => (
                    <option key={points} value={points}>{points}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedStories.length >= 3 && (
        <ConsistencyFeedback
          stories={selectedStories}
          showCrossDomainAnalysis={true}
          onConsistencyChange={handleConsistencyChange}
        />
      )}

      {selectedStories.length >= 4 && (
        <button className="proceed-button" onClick={proceedToNextPhase}>
          Continue to Advanced Scenarios
        </button>
      )}
    </div>
  );

  const renderAdvancedScenarios = () => (
    <div className="exercise-phase">
      <h2>Phase 3: Advanced Consistency Scenarios</h2>
      <p>
        Practice with challenging scenarios that test your consistency skills.
      </p>

      <div className="scenarios-section">
        {consistencyScenarios.map(scenario => (
          <div key={scenario.id} className="scenario-card">
            <h3>{scenario.title}</h3>
            <p>{scenario.description}</p>
            
            {scenario.storyPairs && scenario.storyPairs.map((pair, index) => (
              <div key={index} className="story-pair">
                <div className="pair-explanation">
                  <strong>Expected:</strong> {pair.expectedConsistency} consistency
                  <br />
                  <strong>Reasoning:</strong> {pair.reasoning}
                </div>
              </div>
            ))}

            {scenario.exercises && scenario.exercises.map((exercise, index) => (
              <div key={index} className="exercise-item">
                <div className="exercise-instruction">
                  {exercise.instruction}
                </div>
                <div className="exercise-hint">
                  <strong>Expected range:</strong> {exercise.expectedAnswer}
                  <br />
                  <strong>Reasoning:</strong> {exercise.reasoning}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <button className="proceed-button" onClick={proceedToNextPhase}>
        Complete Exercise
      </button>
    </div>
  );

  const renderSummary = () => (
    <div className="exercise-phase">
      <h2>Exercise Complete!</h2>
      
      <div className="summary-content">
        <div className="completion-stats">
          <h3>Your Performance</h3>
          {consistencyData && (
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Final Consistency Score:</span>
                <span className={`stat-value ${consistencyData.overallScore >= 80 ? 'good' : consistencyData.overallScore >= 60 ? 'warning' : 'poor'}`}>
                  {consistencyData.overallScore}%
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Stories Estimated:</span>
                <span className="stat-value">{Object.keys(userEstimates).length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Issues Identified:</span>
                <span className="stat-value">{consistencyData.hasIssues ? 'Yes' : 'No'}</span>
              </div>
            </div>
          )}
        </div>

        <div className="key-takeaways">
          <h3>Key Takeaways</h3>
          <ul>
            <li>Consistency in story point estimation requires focusing on relative complexity</li>
            <li>Cross-domain stories should use the same estimation scale and principles</li>
            <li>Real-time feedback helps identify and correct estimation inconsistencies</li>
            <li>Team context affects estimates, but the approach should remain consistent</li>
          </ul>
        </div>

        <div className="next-steps">
          <h3>Next Steps</h3>
          <p>
            Practice these consistency principles with your team during Planning Poker sessions. 
            Use reference stories to maintain alignment and discuss any significant estimate divergences.
          </p>
        </div>
      </div>
    </div>
  );

  const renderCurrentPhase = () => {
    switch (currentPhase) {
      case 'introduction':
        return renderIntroduction();
      case 'basic-estimation':
        return renderBasicEstimation();
      case 'cross-domain':
        return renderCrossDomainExercise();
      case 'advanced-scenarios':
        return renderAdvancedScenarios();
      case 'summary':
        return renderSummary();
      default:
        return renderIntroduction();
    }
  };

  return (
    <div className="consistency-exercise">
      <div className="progress-indicator">
        <div className="progress-steps">
          {['introduction', 'basic-estimation', 'cross-domain', 'advanced-scenarios', 'summary'].map((phase, index) => (
            <div 
              key={phase}
              className={`progress-step ${currentPhase === phase ? 'active' : ''} ${completedPhases.has(phase) ? 'completed' : ''}`}
            >
              {index + 1}
            </div>
          ))}
        </div>
      </div>

      {renderCurrentPhase()}
    </div>
  );
};

export default ConsistencyExercise;