import React, { useState, useEffect } from 'react';
import { 
  validateStorySetConsistency, 
  validateCrossDomainConsistency,
  getRealTimeFeedback 
} from '../../../utils/consistencyValidation.js';
import './ConsistencyFeedback.css';

/**
 * Real-time consistency feedback component for story point estimation
 */
const ConsistencyFeedback = ({ 
  stories = [], 
  referenceStories = [],
  showCrossDomainAnalysis = false,
  onConsistencyChange = () => {}
}) => {
  const [consistencyData, setConsistencyData] = useState(null);
  const [realTimeFeedback, setRealTimeFeedback] = useState(null);
  const [crossDomainAnalysis, setCrossDomainAnalysis] = useState(null);

  useEffect(() => {
    if (stories.length === 0) {
      setConsistencyData(null);
      setRealTimeFeedback(null);
      return;
    }

    // Calculate overall consistency
    const consistency = validateStorySetConsistency(stories);
    setConsistencyData(consistency);

    // Get real-time feedback
    const feedback = getRealTimeFeedback(stories, referenceStories);
    setRealTimeFeedback(feedback);

    // Notify parent of consistency changes
    onConsistencyChange({
      overallScore: consistency.overallScore,
      hasIssues: consistency.issues.length > 0,
      feedbackScore: feedback.consistencyScore
    });

    // Cross-domain analysis if requested
    if (showCrossDomainAnalysis) {
      const technicalStories = stories.filter(s => s.domain === 'technical');
      const businessStories = stories.filter(s => s.domain === 'business');
      
      if (technicalStories.length > 0 && businessStories.length > 0) {
        const crossDomain = validateCrossDomainConsistency(technicalStories, businessStories);
        setCrossDomainAnalysis(crossDomain);
      }
    }
  }, [stories, referenceStories, showCrossDomainAnalysis, onConsistencyChange]);

  if (!consistencyData && !realTimeFeedback) {
    return (
      <div className="consistency-feedback">
        <div className="feedback-placeholder">
          Add story estimates to see consistency analysis
        </div>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'good';
    if (score >= 60) return 'warning';
    return 'poor';
  };

  return (
    <div className="consistency-feedback">
      {/* Overall Consistency Score */}
      {consistencyData && (
        <div className="consistency-score">
          <div className="score-header">
            <h3>Consistency Score</h3>
            <div className={`score-badge ${getScoreColor(consistencyData.overallScore)}`}>
              {consistencyData.overallScore}%
            </div>
          </div>
          
          {consistencyData.overallScore < 80 && (
            <div className="score-explanation">
              This score reflects how well your story point estimates align with relative complexity differences.
            </div>
          )}
        </div>
      )}

      {/* Real-time Warnings */}
      {realTimeFeedback && realTimeFeedback.warnings.length > 0 && (
        <div className="feedback-warnings">
          <h4>⚠️ Consistency Warnings</h4>
          <ul>
            {realTimeFeedback.warnings.map((warning, index) => (
              <li key={index} className="warning-item">{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {realTimeFeedback && realTimeFeedback.suggestions.length > 0 && (
        <div className="feedback-suggestions">
          <h4>💡 Suggestions</h4>
          <ul>
            {realTimeFeedback.suggestions.map((suggestion, index) => (
              <li key={index} className="suggestion-item">{suggestion}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Detailed Issues */}
      {consistencyData && consistencyData.issues.length > 0 && (
        <div className="consistency-issues">
          <h4>Detailed Analysis</h4>
          {consistencyData.issues.map((issue, index) => (
            <div key={index} className="issue-item">
              <div className="issue-type">{issue.type.replace('_', ' ')}</div>
              <div className="issue-stories">
                Stories: {issue.stories.join(' vs ')}
              </div>
              <div className="issue-feedback">{issue.feedback}</div>
              <div className="issue-score">
                Consistency: {issue.score}%
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cross-Domain Analysis */}
      {crossDomainAnalysis && crossDomainAnalysis.hasCrossDomainInconsistencies && (
        <div className="cross-domain-analysis">
          <h4>Cross-Domain Consistency</h4>
          {crossDomainAnalysis.crossDomainIssues.map((issue, index) => (
            <div key={index} className="cross-domain-issue">
              <div className="issue-description">{issue.issue}</div>
              <div className="story-comparison">
                Technical: "{issue.technicalStory}" vs Business: "{issue.businessStory}"
              </div>
              <div className="issue-suggestion">{issue.suggestion}</div>
            </div>
          ))}
        </div>
      )}

      {/* Recommendations */}
      {consistencyData && consistencyData.recommendations.length > 0 && (
        <div className="consistency-recommendations">
          <h4>Recommendations</h4>
          <ul>
            {consistencyData.recommendations.map((rec, index) => (
              <li key={index} className="recommendation-item">{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Cross-Domain Recommendations */}
      {crossDomainAnalysis && crossDomainAnalysis.recommendations.length > 0 && (
        <div className="cross-domain-recommendations">
          <h4>Cross-Domain Best Practices</h4>
          <ul>
            {crossDomainAnalysis.recommendations.map((rec, index) => (
              <li key={index} className="recommendation-item">{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ConsistencyFeedback;