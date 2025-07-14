# Agile Mastery Hub 🎯

An extensible multi-module learning platform designed to teach agile development practices through interactive exercises. Master story point estimation, story hierarchy, and other agile concepts with hands-on learning modules.

![React](https://img.shields.io/badge/React-18.2.0-blue) ![Vite](https://img.shields.io/badge/Vite-4.5.3-green) ![License](https://img.shields.io/badge/License-MIT-yellow) ![Modules](https://img.shields.io/badge/Modules-2-purple)

## 🎓 Learning Modules

### 📊 Story Point Estimation Mastery (Beginner)
- **Relative Sizing Fundamentals** - Understand why story points work better than time estimates
- **Fibonacci Sequence Application** - Learn why 1, 2, 3, 5, 8, 13 creates better estimates
- **Complexity vs. Effort** - Distinguish between different factors that affect story sizing
- **Team Consistency** - Build shared understanding for reliable velocity planning

### 📋 Story Hierarchy & Breakdown (Intermediate)
- **Epic vs Feature vs Story** - Learn the hierarchy and distinctions between requirement levels
- **Story Decomposition** - Master techniques for breaking down large stories effectively
- **Granularity Assessment** - Identify appropriate sizing levels for different requirements
- **User Story Best Practices** - Apply proven patterns for writing effective user stories

## 🚀 Features

### 🎯 Story Point Estimation Module
**Exercise 1: Abstract Comparisons**
- Interactive drag-and-drop interface using geometric shapes
- Learn relative sizing with abstract items (grain of sand → mountain)
- Immediate feedback with explanations
- Foundation building for story point concepts

**Exercise 2: User Stories**
- Real-world user story estimation practice
- Fibonacci sequence story point assignment (1, 2, 3, 5, 8, 13)
- Detailed feedback covering complexity, effort, and uncertainty factors
- Progressive difficulty with practical examples

**Exercise 3: Core Principles Recap**
- Interactive true/false quiz (8 questions)
- Comprehensive learning summary
- Performance tracking and results analysis
- Reinforcement of key concepts learned

### 📋 Story Hierarchy Module
**Exercise 1: Epic vs Feature vs Story**
- Interactive categorization exercise
- Learn to distinguish between different requirement levels
- Drag-and-drop interface for hands-on practice
- Immediate feedback with explanations

**Exercise 2: Story Decomposition**
- Practice breaking down large user stories
- Multiple realistic scenarios
- Step-by-step decomposition guidance
- Compare your solutions with expert suggestions

### 🎮 Platform Features
- **Multi-Module Architecture** - Extensible platform supporting multiple learning modules
- **Prerequisites System** - Modules unlock as you complete prerequisites
- **Independent Progress Tracking** - Track progress separately for each module
- **Lazy Loading** - Optimized performance with code splitting
- **Responsive Design** - Works seamlessly across all devices
- **Persistent Progress** - Your progress is saved automatically

## 🛠️ Tech Stack

- **Frontend**: React 18.2.0 with modern hooks and Suspense
- **Build Tool**: Vite 4.5.3 for fast development and hot reloading
- **Drag & Drop**: @dnd-kit for accessible interactions
- **Styling**: Modern CSS with gradients, animations, and responsive design
- **State Management**: React useState with hierarchical progress tracking
- **Architecture**: Multi-module system with lazy loading and code splitting
- **Data Management**: JSON-based configuration with dynamic module loading
- **Performance**: Optimized with lazy imports and component-level code splitting

## 📦 Installation

### Prerequisites
- Node.js 18.16.0 or higher
- npm (Homebrew version recommended: `/opt/homebrew/bin/npm`)

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd storypoints

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173/`

## 🎮 How to Use

### Getting Started
1. **Choose a Module**: Start with "Story Point Estimation Mastery" (beginner-friendly)
2. **Complete Prerequisites**: Some modules require completing previous modules first
3. **Progress Through Exercises**: Each module contains 2-3 interactive exercises
4. **Track Your Progress**: Monitor completion through the navigation panel and progress tracker

### Learning Path
1. **Story Point Estimation Mastery** (Beginner)
   - Exercise 1: Abstract Comparisons
   - Exercise 2: User Stories
   - Exercise 3: Core Principles Quiz

2. **Story Hierarchy & Breakdown** (Intermediate - requires Story Points completion)
   - Exercise 1: Epic vs Feature vs Story
   - Exercise 2: Story Decomposition

Each module builds upon agile fundamentals, creating a comprehensive learning experience.

## 🏗️ Project Structure

```
src/
├── components/
│   ├── common/                    # Shared components
│   │   ├── Breadcrumbs.jsx        # Navigation breadcrumbs
│   │   ├── ModuleCard.jsx         # Module selection cards
│   │   ├── ModuleRouter.jsx       # Module-level routing
│   │   └── ProgressTracker.jsx    # Cross-module progress tracking
│   ├── modules/                   # Module-specific components
│   │   ├── story-points/          # Story point estimation module
│   │   │   ├── StoryPointModule.jsx
│   │   │   ├── Exercise1.jsx      # Abstract comparisons
│   │   │   ├── Exercise2.jsx      # User stories
│   │   │   └── Exercise3.jsx      # Core principles quiz
│   │   └── story-hierarchy/       # Story hierarchy module
│   │       ├── StoryHierarchyModule.jsx
│   │       ├── Exercise1.jsx      # Epic vs Feature vs Story
│   │       └── Exercise2.jsx      # Story decomposition
│   ├── Home.jsx                   # Module hub/landing page
│   ├── Navigation.jsx             # Multi-module navigation
│   ├── SortableItem.jsx           # Shared drag-and-drop component
│   ├── PointSelector.jsx          # Shared point selection component
│   └── UserStoryItem.jsx          # Shared user story component
├── data/
│   ├── modules/                   # Module-specific data
│   │   ├── story-points/          # Story point module data
│   │   │   ├── module-config.json
│   │   │   ├── exercise1-items.json
│   │   │   ├── exercise2-stories.json
│   │   │   └── exercise3-questions.json
│   │   └── story-hierarchy/       # Story hierarchy module data
│   │       └── module-config.json
│   ├── platform-config.json      # Platform-wide configuration
│   └── schema.md                  # Data structure documentation
├── utils/
│   ├── dataLoader.js              # Exercise data loading utilities
│   ├── moduleLoader.js            # Module configuration loading
│   ├── progressManager.js         # Hierarchical progress tracking
│   └── routingUtils.js            # Navigation and routing utilities
├── App.jsx                        # Main application with lazy loading
├── App.css                        # Global styles and themes
└── main.jsx                       # Application entry point
```

## 🎨 Design Philosophy

- **Modular Architecture**: Extensible platform supporting independent learning modules
- **Progressive Learning**: Structured curriculum with prerequisite-based module unlocking
- **Minimalist UI**: Clean, distraction-free learning environment
- **Progressive Disclosure**: Information revealed as needed
- **Immediate Feedback**: Real-time learning reinforcement
- **Performance First**: Lazy loading and code splitting for optimal performance
- **Accessibility**: Keyboard navigation and screen reader support
- **Mobile Responsive**: Works seamlessly across all devices
- **Data-Driven**: JSON-based configuration for easy content management

## 🏛️ Architecture

### Multi-Module System
The platform uses a scalable multi-module architecture that allows for easy addition of new learning modules:

- **Platform Configuration**: Central configuration defining available modules and prerequisites
- **Module Independence**: Each module is self-contained with its own components, data, and configuration
- **Lazy Loading**: Modules and exercises are loaded on-demand for optimal performance
- **Hierarchical Progress**: Independent progress tracking per module with cross-module prerequisites
- **Dynamic Routing**: Flexible navigation system supporting module and exercise-level routing

### Adding New Modules
1. Create module directory structure in `src/components/modules/[module-id]/`
2. Add module configuration in `src/data/modules/[module-id]/module-config.json`
3. Update platform configuration in `src/data/platform-config.json`
4. Implement module wrapper component extending the base module interface
5. Add module support to `ModuleRouter` and `moduleLoader`

## 🧪 Testing

A comprehensive test checklist is available in `test-multi-module.js` covering:
- Multi-module navigation flow
- Independent progress tracking
- Prerequisites enforcement
- Lazy loading functionality
- Drag and drop interactions
- Quiz interactions
- Responsive design
- Accessibility features

## 🚀 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Development Notes

- **Hot Module Replacement**: Vite's HMR for instant updates during development
- **Code Quality**: ESLint configured for React best practices
- **Styling**: Component-scoped CSS with modern features
- **Modern JavaScript**: ES2022 features including dynamic imports
- **Performance**: Lazy loading with React.Suspense and code splitting
- **State Management**: Hierarchical progress tracking with localStorage persistence
- **Module System**: Dynamic module loading with JSON-based configuration

## 📚 Educational Approach

The platform follows proven educational principles:
- **Modular Learning**: Independent modules focusing on specific agile concepts
- **Prerequisites System**: Structured learning path ensuring foundational knowledge
- **Learning by Doing**: Hands-on interactive exercises with real-world scenarios
- **Immediate Feedback**: Instant validation and detailed explanations
- **Progressive Complexity**: Building from simple to complex concepts across modules
- **Spaced Repetition**: Key concepts reinforced across exercises and modules
- **Visual Learning**: Drag-and-drop interfaces and visual representations
- **Adaptive Pacing**: Self-paced learning with progress tracking and persistence

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with React 18 and Vite for modern web development
- Uses @dnd-kit for accessible drag-and-drop interactions
- Inspired by agile estimation and story writing best practices
- Designed for practical learning and skill building in agile methodologies
- Multi-module architecture enables extensible learning experiences

---

**Ready to master agile practices?** Start your learning journey with our interactive modules! 🎯📋
