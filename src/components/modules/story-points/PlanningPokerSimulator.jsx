import React, { useState, useEffect } from 'react';
import './PlanningPokerSimulator.css';

/**
 * PlanningPokerSimulator - Interactive collaborative estimation simulation
 * Demonstrates Planning Poker technique with multiple team member perspectives
 * Shows estimate divergence, discussion facilitation, and consensus building
 */
const PlanningPokerSimulator = ({ 
  stories = [], 
  teamMembers = [], 
  onEstimationComplete = () => {},
  onRoundComplete = () => {}
}) => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [estimationPhase, setEstimationPhase] = useState('initial'); // initial, revealed, discussion, consensus
  const [memberEstimates, setMemberEstimates] = useState({});
  const [discussionPoints, setDiscussionPoints] = useState([]);
  const [consensusEstimate, setConsensusEstimate] = useState(null);
  const [showIndividualEstimates, setShowIndividualEstimates] = useState(false);
  const [simulationStats, setSimulationStats] = useState({
    roundsCompleted: 0,
    averageDiscussionTime: 0,
    consensusReached: 0
  });

  const currentStory = stories[currentStoryIndex];
  const fibonacciSequence = [1, 2, 3, 5, 8, 13, 21, '?'];

  // Initialize estimates for current story
  useEffect(() => {
    if (currentStory && teamMembers.length > 0) {
      initializeEstimates();
    }
  }, [currentStoryIndex, currentStory, teamMembers]);

  const initializeEstimates = () => {
    const estimates = {};
    teamMembers.forEach(member => {
      // Generate realistic estimates based on member experience and story complexity
      const baseEstimate = generateRealisticEstimate(member, currentStory);
      estimates[member.id] = {
        estimate: baseEstimate,
        reasoning: generateReasoning(member, currentStory, baseEstimate),
        confidence: member.experienceLevel === 'senior' ? 'high' : 
                   member.experienceLevel === 'intermediate' ? 'medium' : 'low'
      };
    });
    setMemberEstimates(estimates);
    setEstimationPhase('initial');
    setConsensusEstimate(null);
    setShowIndividualEstimates(false);
    generateDiscussionPoints();
  };

  const generateRealisticEstimate = (member, story) => {
    if (!story.estimationVariance) return 5;
    
    // Use team context to determine estimate
    const teamType = `${member.experienceLevel}-team`;
    if (story.estimationVariance[teamType]) {
      return story.estimationVariance[teamType].points;
    }
    
    // Fallback logic based on experience level
    const baseComplexity = story.complexityFactors?.technical || 'medium';
    let estimate = 5;
    
    if (baseComplexity === 'low') estimate = 3;
    else if (baseComplexity === 'high') estimate = 8;
    
    // Adjust based on experience
    if (member.experienceLevel === 'junior') {
      estimate = Math.min(estimate * 1.5, 13);
    } else if (member.experienceLevel === 'senior') {
      estimate = Math.max(estimate * 0.7, 1);
    }
    
    return Math.round(estimate);
  };

  const generateReasoning = (member, story, estimate) => {
    const reasons = [];
    
    if (member.experienceLevel === 'junior') {
      reasons.push("Need time to research and understand requirements");
      if (estimate > 8) reasons.push("Complex for our current skill level");
    } else if (member.experienceLevel === 'senior') {
      reasons.push("Have implemented similar features before");
      if (estimate <= 3) reasons.push("Straightforward implementation");
    }
    
    if (story.complexityFactors?.uncertainty === 'high') {
      reasons.push("High uncertainty requires careful planning");
    }
    
    if (story.dependencies?.length > 0) {
      reasons.push("External dependencies add complexity");
    }
    
    return reasons.join('. ') || "Standard implementation effort expected.";
  };

  const generateDiscussionPoints = () => {
    if (!currentStory) return;
    
    const points = [];
    const estimates = Object.values(memberEstimates).map(e => e.estimate);
    const minEstimate = Math.min(...estimates);
    const maxEstimate = Math.max(...estimates);
    
    if (maxEstimate - minEstimate > 3) {
      points.push({
        type: 'divergence',
        message: `Large estimate spread (${minEstimate}-${maxEstimate}). Let's discuss the differences.`,
        speaker: 'facilitator'
      });
    }
    
    if (currentStory.complexityFactors?.uncertainty === 'high') {
      points.push({
        type: 'uncertainty',
        message: "This story has high uncertainty. Should we consider a spike first?",
        speaker: 'senior-member'
      });
    }
    
    if (maxEstimate > 8) {
      points.push({
        type: 'breakdown',
        message: "Some estimates are quite high. Can we break this story down further?",
        speaker: 'scrum-master'
      });
    }
    
    setDiscussionPoints(points);
  };

  const revealEstimates = () => {
    setShowIndividualEstimates(true);
    setEstimationPhase('revealed');
    
    // Check if estimates are close enough for consensus
    const estimates = Object.values(memberEstimates).map(e => e.estimate);
    const minEstimate = Math.min(...estimates);
    const maxEstimate = Math.max(...estimates);
    
    if (maxEstimate - minEstimate <= 2) {
      // Close estimates - can move to consensus quickly
      setTimeout(() => {
        setEstimationPhase('consensus');
        const avgEstimate = Math.round(estimates.reduce((a, b) => a + b, 0) / estimates.length);
        setConsensusEstimate(avgEstimate);
      }, 2000);
    } else {
      // Need discussion
      setTimeout(() => {
        setEstimationPhase('discussion');
      }, 1500);
    }
  };

  const startDiscussion = () => {
    setEstimationPhase('discussion');
  };

  const reachConsensus = (finalEstimate) => {
    setConsensusEstimate(finalEstimate);
    setEstimationPhase('consensus');
    
    // Update simulation stats
    setSimulationStats(prev => ({
      ...prev,
      roundsCompleted: prev.roundsCompleted + 1,
      consensusReached: prev.consensusReached + 1
    }));
    
    onRoundComplete({
      story: currentStory,
      finalEstimate,
      individualEstimates: memberEstimates,
      discussionPoints
    });
  };

  const nextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      // Simulation complete
      onEstimationComplete({
        totalStories: stories.length,
        stats: simulationStats
      });
    }
  };

  const resetSimulation = () => {
    setCurrentStoryIndex(0);
    setSimulationStats({
      roundsCompleted: 0,
      averageDiscussionTime: 0,
      consensusReached: 0
    });
  };

  if (!currentStory || teamMembers.length === 0) {
    return (
      <div className="planning-poker-simulator">
        <div className="simulator-setup">
          <h3>Planning Poker Simulator Setup</h3>
          <p>Please provide stories and team members to start the simulation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="planning-poker-simulator">
      <div className="simulator-header">
        <h3>Planning Poker Simulation</h3>
        <div className="progress-indicator">
          Story {currentStoryIndex + 1} of {stories.length}
        </div>
      </div>

      <div className="story-card">
        <h4>{currentStory.title}</h4>
        <p className="story-description">{currentStory.description}</p>
        
        {currentStory.acceptanceCriteria && (
          <div className="acceptance-criteria">
            <h5>Acceptance Criteria:</h5>
            <ul>
              {currentStory.acceptanceCriteria.map((criteria, index) => (
                <li key={index}>{criteria}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="estimation-area">
        {estimationPhase === 'initial' && (
          <div className="initial-estimation">
            <h4>Team Members Are Estimating...</h4>
            <div className="team-members">
              {teamMembers.map(member => (
                <div key={member.id} className="member-card estimating">
                  <div className="member-info">
                    <span className="member-name">{member.name}</span>
                    <span className="member-role">{member.role}</span>
                    <span className="experience-level">{member.experienceLevel}</span>
                  </div>
                  <div className="card-back">?</div>
                </div>
              ))}
            </div>
            <button 
              className="reveal-button"
              onClick={revealEstimates}
            >
              Reveal Estimates
            </button>
          </div>
        )}

        {estimationPhase === 'revealed' && (
          <div className="revealed-estimates">
            <h4>Estimates Revealed</h4>
            <div className="team-estimates">
              {teamMembers.map(member => {
                const estimate = memberEstimates[member.id];
                return (
                  <div key={member.id} className="member-estimate">
                    <div className="member-info">
                      <span className="member-name">{member.name}</span>
                      <span className="experience-level">{member.experienceLevel}</span>
                    </div>
                    <div className="estimate-card">
                      {estimate?.estimate}
                    </div>
                    <div className="confidence-indicator">
                      Confidence: {estimate?.confidence}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {estimationPhase === 'discussion' && (
          <div className="discussion-phase">
            <h4>Team Discussion</h4>
            <div className="discussion-points">
              {discussionPoints.map((point, index) => (
                <div key={index} className={`discussion-point ${point.type}`}>
                  <span className="speaker">{point.speaker}:</span>
                  <span className="message">{point.message}</span>
                </div>
              ))}
            </div>
            
            <div className="member-reasoning">
              <h5>Team Member Reasoning:</h5>
              {teamMembers.map(member => {
                const estimate = memberEstimates[member.id];
                return (
                  <div key={member.id} className="reasoning-item">
                    <strong>{member.name} ({estimate?.estimate} points):</strong>
                    <p>{estimate?.reasoning}</p>
                  </div>
                );
              })}
            </div>

            <div className="consensus-options">
              <h5>Reach Consensus:</h5>
              <div className="estimate-options">
                {fibonacciSequence.filter(val => val !== '?').map(value => (
                  <button
                    key={value}
                    className="consensus-option"
                    onClick={() => reachConsensus(value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {estimationPhase === 'consensus' && (
          <div className="consensus-reached">
            <h4>Consensus Reached!</h4>
            <div className="final-estimate">
              <span className="estimate-value">{consensusEstimate}</span>
              <span className="estimate-label">Story Points</span>
            </div>
            
            <div className="consensus-benefits">
              <h5>Benefits of Team Discussion:</h5>
              <ul>
                <li>Shared understanding of requirements</li>
                <li>Identified potential risks and complexities</li>
                <li>Leveraged diverse team perspectives</li>
                <li>More accurate estimate through collaboration</li>
              </ul>
            </div>

            <div className="navigation-buttons">
              {currentStoryIndex < stories.length - 1 ? (
                <button className="next-story-button" onClick={nextStory}>
                  Next Story
                </button>
              ) : (
                <button className="complete-simulation-button" onClick={nextStory}>
                  Complete Simulation
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="simulation-stats">
        <h5>Simulation Progress:</h5>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Stories Completed:</span>
            <span className="stat-value">{simulationStats.roundsCompleted}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Consensus Rate:</span>
            <span className="stat-value">
              {simulationStats.roundsCompleted > 0 
                ? Math.round((simulationStats.consensusReached / simulationStats.roundsCompleted) * 100)
                : 0}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanningPokerSimulator;