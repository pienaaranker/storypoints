import { useState, useEffect } from 'react'
import './Home.css'
import ModuleCard from './common/ModuleCard'
import ProgressTracker from './common/ProgressTracker'
import { loadPlatformConfig } from '../utils/moduleLoader'

function Home({ moduleProgress, onNavigate, onStartFresh }) {
  const [platformConfig, setPlatformConfig] = useState(null)
  const [availableModules, setAvailableModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load platform configuration on component mount
  useEffect(() => {
    const loadPlatform = async () => {
      try {
        setLoading(true)
        setError(null)

        const config = await loadPlatformConfig()
        setPlatformConfig(config)
        setAvailableModules(config.platform.modules || [])
      } catch (err) {
        console.error('Failed to load platform config:', err)
        setError(err.message)
        // Fallback to basic configuration
        const fallbackConfig = {
          platform: {
            name: 'Agile Mastery Hub',
            subtitle: 'Master agile practices through interactive learning',
            modules: [
              {
                id: 'story-points',
                title: 'Story Point Estimation Mastery',
                description: 'Master the art of relative sizing in agile development',
                icon: '🎯',
                difficulty: 'Beginner',
                estimatedTime: '30-45 minutes',
                prerequisites: [],
                status: 'available'
              }
            ]
          }
        }
        setPlatformConfig(fallbackConfig)
        setAvailableModules(fallbackConfig.platform.modules)
      } finally {
        setLoading(false)
      }
    }

    loadPlatform()
  }, [])

  const handleModuleNavigation = (moduleId) => {
    if (onNavigate) {
      onNavigate('module', moduleId)
    }
  }

  const getModuleStatus = (module) => {
    const progress = moduleProgress[module.id]
    if (!progress) return 'available'

    // Check prerequisites
    if (module.prerequisites && module.prerequisites.length > 0) {
      const prerequisitesMet = module.prerequisites.every(prereqId =>
        moduleProgress[prereqId]?.moduleCompleted
      )
      if (!prerequisitesMet) return 'locked'
    }

    return module.status || 'available'
  }

  if (loading) {
    return (
      <div className="home">
        <div className="home-header">
          <h1 className="home-title">Agile Mastery Hub</h1>
          <p className="home-subtitle">Loading platform...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="home">
        <div className="home-header">
          <h1 className="home-title">Agile Mastery Hub</h1>
          <p className="home-subtitle">Error loading platform: {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="home">
      <div className="home-header">
        <h1 className="home-title">{platformConfig?.platform?.name || 'Agile Mastery Hub'}</h1>
        <p className="home-subtitle">
          {platformConfig?.platform?.subtitle || 'Master agile practices through interactive learning'}
        </p>
      </div>

      <ProgressTracker
        moduleProgress={moduleProgress}
        availableModules={availableModules}
        showDetails={true}
        size="large"
      />

      <div className="modules-section">
        <h2 className="modules-title">Learning Modules</h2>
        <div className="modules-grid">
          {availableModules.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              status={getModuleStatus(module)}
              progress={moduleProgress[module.id]}
              onNavigate={handleModuleNavigation}
            />
          ))}
        </div>
      </div>

      {onStartFresh && (
        <div className="home-actions">
          <button className="start-fresh-button" onClick={onStartFresh}>
            Start Fresh
          </button>
        </div>
      )}
    </div>
  )
}

export default Home
