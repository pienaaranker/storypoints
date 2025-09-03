import React, { useState, useEffect } from 'react';
import './RealisticEstimationChallenges.css';

const RealisticEstimationChallenges = ({ onComplete }) => {
  const [challengeData, setChallengeData] = useState(null);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [challengeType, setChallengeType] = useState('highUncertainty');
  const [selectedScenario, setSelectedScenario] = useState(0);
  const [userEstimate, setUserEstimate] = useState('');
  const [showGuidance, setShowGuidance] = useState(false);
  const [completedChallenges, setCompletedChallenges] = useState(new Set());

  useEffect(() => {
    loadChallengeData();
  }, []);

  const loadChallengeData = async () => {
    try {
      const response = await fetch('/src/data/modules/story-points/realistic-estimation-challenges.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setChallengeData(data);
      setCurrentChallenge(data.highUncertaintyScenarios[0]);
    } catch (error) {
      console.error('Failed to load challenge data:', error);
    }
  };

  const challengeTypes = [
    { key: 'highUncertainty', label: 'High Uncertainty Scenarios', data: 'highUncertaintyScenarios' },
    { key: 'dependencies', label: 'Dependency Management', data: 'dependencyScenarios' },
    { key: 'technicalDebt', label: 'Technical Debt Impact', data: 'technicalDebtScenarios' },
    { key: 'spikeTransition', label: 'Spike to Story Transitions', data: 'spikeToStoryTransitions' }
  ];

  const handleChallengeTypeChange = (type) => {
    setChallengeType(type);
    setSelectedScenario(0);
    setUserEstimate('');
    setShowGuidance(false);
    
    const typeData = challengeTypes.find(t => t.key === type);
    if (challengeData && typeData) {
      const scenarios = challengeData[typeData.data];
      setCurrentChallenge(scenarios[0]);
    }
  };

  const handleScenarioChange = (index) => {
    setSelectedScenario(index);
    setUserEstimate('');
    setShowGuidance(false);
    
    const typeData = challengeTypes.find(t => t.key === challengeType);
    if (challengeData && typeData) {
      const scenarios = challengeData[typeData.data];
      setCurrentChallenge(scenarios[index]);
    }
  };

  const handleEstimateSubmit = () => {
    setShowGuidance(true);
    const challengeId = `${challengeType}-${selectedScenario}`;
    setCompletedChallenges(prev => new Set([...prev, challengeId]));
  };

  const renderUncertaintyFactors = (factors) => {
    return (
      <div className="uncertainty-factors">
        <h4>Uncertainty Factors:</h4>
        <ul>
          {Object.entries(factors).map(([factor, description]) => (
            <li key={factor}>
              <strong>{factor.replace(/([A-Z])/g, ' $1').toLowerCase()}:</strong> {description}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderDependencies = (dependencies) => {
    return (
      <div className="dependencies">
        <h4>Dependencies:</h4>
        {dependencies.map((dep, index) => (
          <div key={index} className={`dependency ${dep.risk}-risk`}>
            <div className="dependency-header">
              <span className="dependency-type">{dep.type}</span>
              <span className="dependency-risk">{dep.risk} risk</span>
            </div>
            <p><strong>Description:</strong> {dep.description}</p>
            <p><strong>Owner:</strong> {dep.owner}</p>
            <p><strong>Estimated Completion:</strong> {dep.estimatedCompletion}</p>
            <p><strong>Impact:</strong> {dep.impact}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderTechnicalDebt = (debt) => {
    return (
      <div className="technical-debt">
        <h4>Technical Debt Context:</h4>
        <p><strong>Description:</strong> {debt.description}</p>
        <p><strong>Age:</strong> {debt.debtAge}</p>
        {debt.previousAttempts && (
          <p><strong>Previous Attempts:</strong> {debt.previousAttempts}</p>
        )}
        
        <div className="debt-impact">
          <h5>Impact Areas:</h5>
          <ul>
            {Object.entries(debt.impact).map(([area, description]) => (
              <li key={area}>
                <strong>{area.replace(/([A-Z])/g, ' $1').toLowerCase()}:</strong> {description}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const renderSpikeInfo = (spike) => {
    return (
      <div className="spike-info">
        <h4>Spike: {spike.title}</h4>
        <p><strong>Time Box:</strong> {spike.timeBox}</p>
        <p><strong>Learning Objective:</strong> {spike.learningObjective}</p>
        
        <div className="spike-criteria">
          <h5>Acceptance Criteria:</h5>
          <ul>
            {spike.acceptanceCriteria.map((criteria, index) => (
              <li key={index}>{criteria}</li>
            ))}
          </ul>
        </div>

        {spike.uncertaintyFactors && (
          <div className="uncertainty-factors">
            <h5>Uncertainty Factors:</h5>
            <ul>
              {spike.uncertaintyFactors.map((factor, index) => (
                <li key={index}>{factor}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderEstimationGuidance = () => {
    if (!showGuidance || !currentChallenge) return null;

    return (
      <div className="estimation-guidance">
        <h4>Estimation Guidance</h4>
        
        {challengeType === 'highUncertainty' && currentChallenge.handlingTechniques && (
          <div className="handling-techniques">
            <h5>Recommended Techniques:</h5>
            
            {currentChallenge.handlingTechniques.spike && (
              <div className="technique">
                <h6>Spike Approach:</h6>
                <p><strong>Title:</strong> {currentChallenge.handlingTechniques.spike.title}</p>
                <p><strong>Time Box:</strong> {currentChallenge.handlingTechniques.spike.timeBox}</p>
                <ul>
                  {currentChallenge.handlingTechniques.spike.objectives.map((obj, index) => (
                    <li key={index}>{obj}</li>
                  ))}
                </ul>
              </div>
            )}

            {currentChallenge.handlingTechniques.conservativeEstimation && (
              <div className="technique">
                <h6>Conservative Estimation:</h6>
                <p>Base estimate: {currentChallenge.handlingTechniques.conservativeEstimation.baseEstimate} points</p>
                <p>Uncertainty buffer: +{currentChallenge.handlingTechniques.conservativeEstimation.uncertaintyBuffer} points</p>
                <p><strong>Total: {currentChallenge.handlingTechniques.conservativeEstimation.totalEstimate} points</strong></p>
                <p><em>{currentChallenge.handlingTechniques.conservativeEstimation.reasoning}</em></p>
              </div>
            )}
          </div>
        )}

        {challengeType === 'dependencies' && currentChallenge.dependencyImpact && (
          <div className="dependency-impact">
            <h5>Dependency Impact Analysis:</h5>
            {Object.entries(currentChallenge.dependencyImpact).map(([approach, impact]) => (
              <div key={approach} className="impact-option">
                <h6>{approach.replace(/([A-Z])/g, ' $1').toLowerCase()}:</h6>
                <p><strong>Points:</strong> {impact.points}</p>
                <p><strong>Reasoning:</strong> {impact.reasoning}</p>
                <p><strong>Approach:</strong> {impact.approach}</p>
              </div>
            ))}
          </div>
        )}

        {challengeType === 'technicalDebt' && currentChallenge.implementationOptions && (
          <div className="implementation-options">
            <h5>Implementation Options:</h5>
            {Object.entries(currentChallenge.implementationOptions).map(([option, details]) => (
              <div key={option} className="option">
                <h6>{option.replace(/([A-Z])/g, ' $1').toLowerCase()}:</h6>
                <p><strong>Points:</strong> {details.points}</p>
                <p><strong>Reasoning:</strong> {details.reasoning}</p>
                {details.risks && (
                  <div className="risks">
                    <strong>Risks:</strong>
                    <ul>
                      {details.risks.map((risk, index) => (
                        <li key={index}>{risk}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {challengeType === 'spikeTransition' && currentChallenge.resultingStories && (
          <div className="resulting-stories">
            <h5>Stories After Spike:</h5>
            {currentChallenge.resultingStories.map((story, index) => (
              <div key={index} className="resulting-story">
                <h6>{story.title} ({story.points} points)</h6>
                <p>{story.description}</p>
                <p><strong>Estimation Basis:</strong> {story.estimationBasis}</p>
                <p><strong>Reasoning:</strong> {story.reasoning}</p>
              </div>
            ))}
            
            {currentChallenge.spikeValue && (
              <div className="spike-value">
                <h6>Spike Value:</h6>
                <ul>
                  {Object.entries(currentChallenge.spikeValue).map(([key, value]) => (
                    <li key={key}>
                      <strong>{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</strong> {value}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (!challengeData || !currentChallenge) {
    return <div className="loading">Loading realistic estimation challenges...</div>;
  }

  const typeData = challengeTypes.find(t => t.key === challengeType);
  const scenarios = challengeData[typeData.data];

  return (
    <div className="realistic-estimation-challenges">
      <div className="challenge-header">
        <h2>Realistic Estimation Challenges</h2>
        <p>Practice estimating stories with real-world complexities including uncertainty, dependencies, and technical debt.</p>
      </div>

      <div className="challenge-controls">
        <div className="challenge-type-selector">
          <label>Challenge Type:</label>
          <select 
            value={challengeType} 
            onChange={(e) => handleChallengeTypeChange(e.target.value)}
          >
            {challengeTypes.map(type => (
              <option key={type.key} value={type.key}>{type.label}</option>
            ))}
          </select>
        </div>

        <div className="scenario-selector">
          <label>Scenario:</label>
          <select 
            value={selectedScenario} 
            onChange={(e) => handleScenarioChange(parseInt(e.target.value))}
          >
            {scenarios.map((scenario, index) => (
              <option key={index} value={index}>
                {challengeType === 'spikeTransition' ? scenario.spike.title : scenario.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="challenge-content">
        <div className="story-details">
          {challengeType === 'spikeTransition' ? (
            renderSpikeInfo(currentChallenge.spike)
          ) : (
            <>
              <h3>{currentChallenge.title}</h3>
              <p className="story-description">{currentChallenge.description}</p>
              
              <div className="acceptance-criteria">
                <h4>Acceptance Criteria:</h4>
                <ul>
                  {currentChallenge.acceptanceCriteria.map((criteria, index) => (
                    <li key={index}>{criteria}</li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {currentChallenge.uncertaintyFactors && renderUncertaintyFactors(currentChallenge.uncertaintyFactors)}
          {currentChallenge.dependencies && renderDependencies(currentChallenge.dependencies)}
          {currentChallenge.technicalDebt && renderTechnicalDebt(currentChallenge.technicalDebt)}
        </div>

        <div className="estimation-section">
          <div className="estimation-input">
            <label>Your Estimate (Story Points):</label>
            <input
              type="number"
              min="1"
              max="21"
              value={userEstimate}
              onChange={(e) => setUserEstimate(e.target.value)}
              placeholder="Enter your estimate"
            />
            <button 
              onClick={handleEstimateSubmit}
              disabled={!userEstimate}
              className="submit-estimate"
            >
              Submit Estimate
            </button>
          </div>

          {renderEstimationGuidance()}
        </div>
      </div>

      <div className="progress-indicator">
        <p>Completed Challenges: {completedChallenges.size} / {
          challengeTypes.reduce((total, type) => total + challengeData[type.data].length, 0)
        }</p>
      </div>
    </div>
  );
};

export default RealisticEstimationChallenges;