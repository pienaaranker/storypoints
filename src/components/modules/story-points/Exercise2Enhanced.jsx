import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers';

import './Exercise.css';
import './Exercise2.css';
import UserStoryItem from '../../UserStoryItem';
import PointSelector from '../../PointSelector';
import TeamContextSelector from './TeamContextSelector';
import { loadUserStories, getExerciseConfig } from '../../../utils/dataLoader';

/**
 * Enhanced Exercise 2 with Team Context Awareness
 * Demonstrates how team context affects story point estimation
 */
function Exercise2Enhanced({ onComplete, onStart, isStarted }) {
  const [stories, setStories] = useState([]);
  const [exerciseConfig, setExerciseConfig] = useState(null);
  const [teamContexts, setTeamContexts] = useState([]);
  const [selectedTeamContext, setSelectedTeamContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState('team-selection'); // 'team-selection', 'ordering', 'pointing', 'feedback'
  const [userPoints, setUserPoints] = useState({});

  // Load exercise data and team contexts on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [userStories, config] = await Promise.all([
          loadUserStories(),
          getExerciseConfig(2)
        ]);

        // Load team context data
        const teamContextResponse = await fetch('/src/data/modules/story-points/team-context-examples.json');
        const teamContextData = await teamContextResponse.json();

        setStories(userStories);
        setExerciseConfig(config);
        setTeamContexts(teamContextData.teamContexts || []);
        
        // Set default team context
        if (teamContextData.teamContexts?.length > 0) {
          setSelectedTeamContext(teamContextData.teamContexts[0]);
        }
      } catch (err) {
        console.error('Failed to load exercise data:', err);
        setError('Failed to load exercise data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setStories((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleTeamContextChange = (context) => {
    setSelectedTeamContext(context);
    // Reset user points when team context changes
    setUserPoints({});
  };

  const handlePointAssignment = (storyId, points) => {
    setUserPoints(prev => ({
      ...prev,
      [storyId]: points
    }));
  };

  const handleStepComplete = () => {
    if (currentStep === 'team-selection') {
      setCurrentStep('ordering');
      if (onStart) onStart();
    } else if (currentStep === 'ordering') {
      setCurrentStep('pointing');
    } else if (currentStep === 'pointing') {
      setCurrentStep('feedback');
    } else if (currentStep === 'feedback') {
      if (onComplete) onComplete();
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'team-selection':
        return selectedTeamContext !== null;
      case 'ordering':
        return true; // Can always proceed from ordering
      case 'pointing':
        return stories.every(story => userPoints[story.id] !== undefined);
      case 'feedback':
        return true;
      default:
        return false;
    }
  };

  const getContextualEstimate = (story) => {
    if (!selectedTeamContext || !story.estimationVariance) {
      return story.correctPoints;
    }
    
    const teamEstimate = story.estimationVariance[selectedTeamContext.id];
    return teamEstimate ? teamEstimate.points : story.correctPoints;
  };

  const getContextualReasoning = (story) => {
    if (!selectedTeamContext || !story.estimationVariance) {
      return story.explanation;
    }
    
    const teamEstimate = story.estimationVariance[selectedTeamContext.id];
    return teamEstimate ? teamEstimate.reasoning : story.explanation;
  };

  const renderTeamSelectionStep = () => (
    <div className="exercise-step">
      <div className="step-header">
        <h3>Step 1: Select Your Team Context</h3>
        <p>
          Choose a team context to understand how team experience affects story point estimation.
          Different teams will estimate the same stories differently based on their capabilities.
        </p>
      </div>

      <TeamContextSelector
        teamContexts={teamContexts}
        selectedContext={selectedTeamContext}
        onContextChange={handleTeamContextChange}
        showVarianceComparison={false}
      />

      {selectedTeamContext && (
        <div className="context-summary" style={{
          background: '#f0f8ff',
          padding: '15px',
          borderRadius: '8px',
          marginTop: '20px',
          border: '1px solid #3498db'
        }}>
          <h4>Selected Team: {selectedTeamContext.name}</h4>
          <p>
            You'll be estimating stories from the perspective of a {selectedTeamContext.experienceLevel} team 
            with {selectedTeamContext.domainKnowledge} domain knowledge working with {selectedTeamContext.technicalStack} technology.
          </p>
        </div>
      )}
    </div>
  );

  const renderOrderingStep = () => (
    <div className="exercise-step">
      <div className="step-header">
        <h3>Step 2: Order Stories by Relative Size</h3>
        <p>
          Drag and drop the stories to order them from smallest to largest effort.
          Consider your team's context: {selectedTeamContext?.name}
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
      >
        <SortableContext items={stories} strategy={verticalListSortingStrategy}>
          <div className="stories-list">
            {stories.map((story) => (
              <UserStoryItem
                key={story.id}
                story={story}
                showPoints={false}
                teamContext={selectedTeamContext}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );

  const renderPointingStep = () => (
    <div className="exercise-step">
      <div className="step-header">
        <h3>Step 3: Assign Story Points</h3>
        <p>
          Assign story points to each story based on your team context and the relative ordering.
          Remember: {selectedTeamContext?.name} perspective.
        </p>
      </div>

      <div className="pointing-interface">
        {stories.map((story) => (
          <div key={story.id} className="story-pointing-item">
            <UserStoryItem
              story={story}
              showPoints={false}
              teamContext={selectedTeamContext}
            />
            <PointSelector
              selectedPoints={userPoints[story.id]}
              onPointsChange={(points) => handlePointAssignment(story.id, points)}
              availablePoints={[1, 2, 3, 5, 8, 13, 21]}
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderFeedbackStep = () => (
    <div className="exercise-step">
      <div className="step-header">
        <h3>Step 4: Compare with Team-Contextual Estimates</h3>
        <p>
          See how your estimates compare with what a {selectedTeamContext?.name} would typically estimate.
        </p>
      </div>

      <div className="feedback-comparison">
        {stories.map((story) => {
          const userEstimate = userPoints[story.id];
          const contextualEstimate = getContextualEstimate(story);
          const reasoning = getContextualReasoning(story);
          const difference = Math.abs(userEstimate - contextualEstimate);
          const isClose = difference <= 2;

          return (
            <div key={story.id} className={`feedback-item ${isClose ? 'close' : 'different'}`}>
              <div className="story-summary">
                <h4>{story.title}</h4>
                <p>{story.description}</p>
              </div>
              
              <div className="estimate-comparison">
                <div className="estimate-box">
                  <span className="label">Your Estimate</span>
                  <span className="points">{userEstimate}</span>
                </div>
                <div className="estimate-box">
                  <span className="label">{selectedTeamContext?.name} Estimate</span>
                  <span className="points">{contextualEstimate}</span>
                </div>
              </div>
              
              <div className="reasoning">
                <strong>Team Reasoning:</strong>
                <p>{reasoning}</p>
              </div>
              
              {!isClose && (
                <div className="difference-note">
                  <strong>Note:</strong> Your estimate differs by {difference} points. 
                  Consider how team context affects complexity perception.
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="exercise-summary">
        <h4>Key Takeaways</h4>
        <ul>
          <li>Team experience significantly affects story point estimates</li>
          <li>The same story can have different complexity for different teams</li>
          <li>Context matters more than absolute point values</li>
          <li>Velocity comparisons between teams are meaningless</li>
        </ul>
      </div>
    </div>
  );

  if (loading) {
    return <div className="loading">Loading exercise...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="exercise-container exercise2-enhanced">
      <div className="exercise-header">
        <h2>{exerciseConfig?.title || 'Story Point Estimation with Team Context'}</h2>
        <p>{exerciseConfig?.description || 'Learn how team context affects story point estimation'}</p>
      </div>

      <div className="progress-indicator">
        <div className={`step ${currentStep === 'team-selection' ? 'active' : currentStep !== 'team-selection' ? 'completed' : ''}`}>
          Team Selection
        </div>
        <div className={`step ${currentStep === 'ordering' ? 'active' : ['pointing', 'feedback'].includes(currentStep) ? 'completed' : ''}`}>
          Ordering
        </div>
        <div className={`step ${currentStep === 'pointing' ? 'active' : currentStep === 'feedback' ? 'completed' : ''}`}>
          Pointing
        </div>
        <div className={`step ${currentStep === 'feedback' ? 'active' : ''}`}>
          Feedback
        </div>
      </div>

      <div className="exercise-content">
        {currentStep === 'team-selection' && renderTeamSelectionStep()}
        {currentStep === 'ordering' && renderOrderingStep()}
        {currentStep === 'pointing' && renderPointingStep()}
        {currentStep === 'feedback' && renderFeedbackStep()}
      </div>

      <div className="exercise-controls">
        <button
          className="btn-primary"
          onClick={handleStepComplete}
          disabled={!canProceed()}
        >
          {currentStep === 'feedback' ? 'Complete Exercise' : 'Continue'}
        </button>
      </div>
    </div>
  );
}

export default Exercise2Enhanced;