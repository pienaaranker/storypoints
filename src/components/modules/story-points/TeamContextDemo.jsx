import React, { useState, useEffect } from 'react';
import TeamContextSelector from './TeamContextSelector';
import { 
  calculateVarianceStats, 
  analyzeVarianceSignificance, 
  getVarianceExplanationFactors,
  generateVarianceRecommendations 
} from '../../../utils/teamContextUtils';

/**
 * Demo component showing TeamContextSelector integration with story data
 * This demonstrates how team context affects story point estimation
 */
const TeamContextDemo = () => {
  const [teamContexts, setTeamContexts] = useState([]);
  const [comparisonStories, setComparisonStories] = useState([]);
  const [selectedContext, setSelectedContext] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null);
  const [varianceAnalysis, setVarianceAnalysis] = useState(null);

  useEffect(() => {
    // Load team context data
    const loadTeamContextData = async () => {
      try {
        const response = await fetch('/src/data/modules/story-points/team-context-examples.json');
        const data = await response.json();
        
        setTeamContexts(data.teamContexts || []);
        setComparisonStories(data.comparisonStories || []);
        
        // Set initial selections
        if (data.teamContexts?.length > 0) {
          setSelectedContext(data.teamContexts[0]);
        }
        if (data.comparisonStories?.length > 0) {
          setSelectedStory(data.comparisonStories[0]);
        }
      } catch (error) {
        console.error('Failed to load team context data:', error);
        // Fallback to empty data
        setTeamContexts([]);
        setComparisonStories([]);
      }
    };

    loadTeamContextData();
  }, []);

  useEffect(() => {
    // Analyze variance when story changes
    if (selectedStory?.estimationsByTeam) {
      const stats = calculateVarianceStats(selectedStory.estimationsByTeam);
      const significance = analyzeVarianceSignificance(selectedStory.estimationsByTeam);
      const factors = getVarianceExplanationFactors(teamContexts, selectedStory.estimationsByTeam);
      const recommendations = generateVarianceRecommendations(significance, factors);
      
      setVarianceAnalysis({
        stats,
        significance,
        factors,
        recommendations
      });
    }
  }, [selectedStory, teamContexts]);

  const handleContextChange = (context) => {
    setSelectedContext(context);
  };

  const handleStoryChange = (story) => {
    setSelectedStory(story);
  };

  const renderStorySelector = () => (
    <div className="story-selector" style={{ marginBottom: '20px' }}>
      <h3>Select a Story to Compare</h3>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {comparisonStories.map((story) => (
          <button
            key={story.id}
            onClick={() => handleStoryChange(story)}
            style={{
              padding: '10px 15px',
              border: selectedStory?.id === story.id ? '2px solid #3498db' : '1px solid #ccc',
              borderRadius: '5px',
              background: selectedStory?.id === story.id ? '#f0f8ff' : 'white',
              cursor: 'pointer'
            }}
          >
            {story.title}
          </button>
        ))}
      </div>
    </div>
  );

  const renderSelectedStoryDetails = () => {
    if (!selectedStory) return null;

    return (
      <div className="story-details" style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
        <h3>{selectedStory.title}</h3>
        <p><strong>Description:</strong> {selectedStory.description}</p>
        
        <div>
          <strong>Acceptance Criteria:</strong>
          <ul>
            {selectedStory.acceptanceCriteria?.map((criteria, index) => (
              <li key={index}>{criteria}</li>
            ))}
          </ul>
        </div>

        {selectedStory.keyLearning && (
          <div style={{ 
            background: '#fff3cd', 
            padding: '15px', 
            borderRadius: '5px', 
            marginTop: '15px',
            border: '1px solid #ffeaa7'
          }}>
            <strong>Key Learning:</strong> {selectedStory.keyLearning}
          </div>
        )}
      </div>
    );
  };

  const renderVarianceAnalysis = () => {
    if (!varianceAnalysis) return null;

    const { stats, significance, factors, recommendations } = varianceAnalysis;

    return (
      <div className="variance-analysis" style={{ marginTop: '20px' }}>
        <h3>Estimation Variance Analysis</h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '15px',
          marginBottom: '20px'
        }}>
          <div style={{ background: 'white', padding: '15px', borderRadius: '5px', border: '1px solid #e1e8ed' }}>
            <h4>Statistics</h4>
            <p><strong>Range:</strong> {stats.range} points</p>
            <p><strong>Average:</strong> {stats.average} points</p>
            <p><strong>Std Dev:</strong> {stats.standardDeviation}</p>
            <p><strong>Variation:</strong> {stats.coefficientOfVariation}%</p>
          </div>
          
          <div style={{ background: 'white', padding: '15px', borderRadius: '5px', border: '1px solid #e1e8ed' }}>
            <h4>Significance</h4>
            <p><strong>Level:</strong> {significance.significance}</p>
            <p><strong>Significant:</strong> {significance.isSignificant ? 'Yes' : 'No'}</p>
            <p style={{ fontSize: '0.9em', color: '#666' }}>{significance.recommendation}</p>
          </div>
        </div>

        {factors.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h4>Variance Factors</h4>
            {factors.map((factor, index) => (
              <div key={index} style={{ 
                background: 'white', 
                padding: '10px', 
                margin: '5px 0', 
                borderRadius: '5px',
                borderLeft: `4px solid ${factor.impact === 'high' ? '#e74c3c' : factor.impact === 'medium' ? '#f39c12' : '#27ae60'}`
              }}>
                <strong>{factor.factor}</strong> ({factor.impact} impact)
                <p style={{ margin: '5px 0 0 0', fontSize: '0.9em', color: '#666' }}>
                  {factor.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {recommendations.length > 0 && (
          <div>
            <h4>Recommendations</h4>
            {recommendations.map((rec, index) => (
              <div key={index} style={{ 
                background: rec.type === 'success' ? '#d4edda' : rec.type === 'warning' ? '#fff3cd' : '#d1ecf1',
                padding: '10px', 
                margin: '5px 0', 
                borderRadius: '5px',
                border: `1px solid ${rec.type === 'success' ? '#c3e6cb' : rec.type === 'warning' ? '#ffeaa7' : '#bee5eb'}`
              }}>
                <strong>{rec.title}</strong> ({rec.priority} priority)
                <p style={{ margin: '5px 0 0 0', fontSize: '0.9em' }}>
                  {rec.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="team-context-demo" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>Team Context Awareness Demo</h2>
      <p>This demo shows how team experience and context affects story point estimation for the same work.</p>
      
      {renderStorySelector()}
      {renderSelectedStoryDetails()}
      
      <TeamContextSelector
        teamContexts={teamContexts}
        selectedContext={selectedContext}
        onContextChange={handleContextChange}
        estimationVariance={selectedStory?.estimationsByTeam || {}}
        currentStory={selectedStory}
        showVarianceComparison={true}
      />
      
      {renderVarianceAnalysis()}
    </div>
  );
};

export default TeamContextDemo;