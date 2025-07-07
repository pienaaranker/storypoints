import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import './UserStoryItem.css'

function UserStoryItem({ id, story, index }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`user-story-item ${isDragging ? 'dragging' : ''}`}
      {...attributes}
      {...listeners}
    >
      <div className="drag-handle">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M7 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
        </svg>
      </div>
      <div className="story-position">#{index}</div>
      <div className="story-content">
        <div className="story-title">{story.title}</div>
        <div className="story-description">{story.description}</div>
        <div className="acceptance-criteria">
          <strong>Key Requirements:</strong>
          <ul>
            {story.acceptanceCriteria.slice(0, 2).map((criteria, idx) => (
              <li key={idx}>{criteria}</li>
            ))}
            {story.acceptanceCriteria.length > 2 && (
              <li>...and {story.acceptanceCriteria.length - 2} more</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default UserStoryItem
