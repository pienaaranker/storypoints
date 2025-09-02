import React, { useState, useEffect } from 'react';
import PlanningPokerSimulator from './PlanningPokerSimulator';
import './Exercise.css';

/**
 * Exercise 4: Collaborative Estimation Simulation
 * Interactive Planning Poker simulation demonstrating team-based estimation
 */
const Exercise4 = ({ onComplete = () => {} }) => {
  const [simulationData, setSimulationData] = useState(null);
  const [currentScenario, setCurrentScenario] = useState(0);
  const [simulationResults, setSimulationResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSimulationData();
  }, []);

  const loadSimulationData = async () => {
    try {
      const response = await fetch('/src/data/modules/story-points/collaborative-estimation-scenarios.json');
      const data = await response.json();
      setSimulationData(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load simulation data:', error);
      setLoading(false);
    }
  };

  const handleRoundComplete = (roundResult) => {
    setSimulationResults(prev => [...prev, roundResult]);
  };

  const handleEstimationComplete = (simulationStats) => {
    setShowResults(true);
    
    // Calculate learning metrics
    const totalRounds = simulationResults.length;
    const consensusRate = totalRounds > 0 ? (simulationStats.consensusReached / totalRounds) * 100 : 0;
    
    onComplete({
      exerciseId: 4,
      completed: true,
      score: Math.round(consensusRate),
      results: simulationResults,
      stats: simulationStats
    });
  };

  const nextScenario = () => {
    if (currentScenario < simulationData.estimationScenarios.length - 1) {
      setCurrentScenario(currentScenario + 1);
      setSimulationResults([]);
      setShowResults(false);
    }
  };

  const resetExercise = () => {
    setCurrentScenario(0);
    setSimulationResults([]);
    setShowResults(false);
  };

  if (loading) {
    return (
      <div className="exercise-container">
        <div className="loading-state">
          <h3>Loading Collaborative Estimation Simulation...</h3>
          <p>Preparing Planning Poker scenarios and team members.</p>
        </div>
      </div>
    );
  }

  if (!simulationData) {
    return (
      <div className="exercise-container">
        <div className="error-state">
          <h3>Unable to Load Simulation</h3>
          <p>Please check your connection and try again.</p>
          <button onClick={loadSimulationData}>Retry</button>
        </div>
      </div>
    );
  }

  const scenario = simulationData.estimationScenarios[currentScenario];
  const teamMembers = simulationData.teamMembers.filter(member => 
    simulationData.simulationSettings.defaultTeam.includes(member.id)
  );

  return (
    <div className="exercise-container">
      <div className="exercise-header">
        <h2>Exercise 4: Collaborative Estimation Simulation</h2>
        <p className="exercise-description">
          Experience Planning Poker with a simulated development team. Learn how collaborative 
          estimation improves accuracy and builds shared understanding.
        </p>
      </div>

      {!showResults ? (
        <div className="simulation-section">
          <div className="scenario-info">
            <h3>{scenario.name}</h3>
            <p>{scenario.description}</p>
            <div className="difficulty-indicator">
              <span className={`difficulty-badge ${scenario.difficulty}`}>
                {scenario.difficulty.charAt(0).toUpperCase() + scenario.difficulty.slice(1)}
              </span>
            </div>
          </div>

          <div className="team-introduction">
            <h4>Meet Your Team:</h4>
            <div className="team-grid">
              {teamMembers.map(member => (
                <div key={member.id} className="team-member-card">
                  <div className="member-avatar">{member.avatar}</div>
                  <div className="member-details">
                    <h5>{member.name}</h5>
                    <p className="member-role">{member.role}</p>
                    <p className="experience-level">{member.experienceLevel} level</p>
                    <div className="member-traits">
                      {member.characteristics.slice(0, 2).map((trait, index) => (
                        <span key={index} className="trait-tag">{trait}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <PlanningPokerSimulator
            stories={scenario.stories}
            teamMembers={teamMembers}
            onRoundComplete={handleRoundComplete}
            onEstimationComplete={handleEstimationComplete}
          />
        </div>
      ) : (
        <div className="results-section">
          <h3>Simulation Results</h3>
          
          <div className="results-summary">
            <div className="summary-stats">
              <div className="stat-card">
                <h4>Stories Estimated</h4>
                <span className="stat-value">{simulationResults.length}</span>
              </div>
              <div className="stat-card">
                <h4>Consensus Rate</h4>
                <span className="stat-value">
                  {simulationResults.length > 0 ? '100%' : '0%'}
                </span>
              </div>
              <div className="stat-card">
                <h4>Learning Points</h4>
                <span className="stat-value">
                  {simulationResults.reduce((total, result) => 
                    total + (result.story.learningPoints?.length || 0), 0
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="estimation-breakdown">
            <h4>Estimation Breakdown by Story:</h4>
            {simulationResults.map((result, index) => (
              <div key={index} className="story-result">
                <h5>{result.story.title}</h5>
                <div className="estimate-comparison">
                  <div className="individual-estimates">
                    <h6>Individual Estimates:</h6>
                    {Object.entries(result.individualEstimates).map(([memberId, estimate]) => {
                      const member = teamMembers.find(m => m.id === memberId);
                      return (
                        <div key={memberId} className="individual-estimate">
                          <span className="member-name">{member?.name}:</span>
                          <span className="estimate-value">{estimate.estimate} points</span>
                          <span className="confidence">({estimate.confidence} confidence)</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="final-estimate">
                    <h6>Team Consensus:</h6>
                    <span className="consensus-value">{result.finalEstimate} points</span>
                  </div>
                </div>
                
                {result.story.learningPoints && (
                  <div className="learning-points">
                    <h6>Key Learning Points:</h6>
                    <ul>
                      {result.story.learningPoints.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="key-takeaways">
            <h4>Key Takeaways from Collaborative Estimation:</h4>
            <div className="takeaway-grid">
              <div className="takeaway-card">
                <h5>🎯 Improved Accuracy</h5>
                <p>Team discussion reveals assumptions and reduces individual biases, leading to more accurate estimates.</p>
              </div>
              <div className="takeaway-card">
                <h5>🤝 Shared Understanding</h5>
                <p>Planning Poker ensures all team members understand the requirements and approach before starting work.</p>
              </div>
              <div className="takeaway-card">
                <h5>🔍 Risk Identification</h5>
                <p>Different perspectives help identify potential risks and complexities that individuals might miss.</p>
              </div>
              <div className="takeaway-card">
                <h5>📚 Knowledge Sharing</h5>
                <p>Experienced team members share insights while junior members ask clarifying questions.</p>
              </div>
            </div>
          </div>

          <div className="navigation-buttons">
            {currentScenario < simulationData.estimationScenarios.length - 1 ? (
              <button className="next-scenario-button" onClick={nextScenario}>
                Try Next Scenario
              </button>
            ) : (
              <button className="complete-exercise-button" onClick={() => onComplete({ exerciseId: 4, completed: true })}>
                Complete Exercise
              </button>
            )}
            <button className="reset-button" onClick={resetExercise}>
              Start Over
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exercise4;