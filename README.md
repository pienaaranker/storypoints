# Story Point Master 🎯

An interactive web application designed to teach story point estimation fundamentals through hands-on exercises. Master the art of relative sizing in agile development with three progressive learning modules.

![Story Point Master](https://img.shields.io/badge/React-18.2.0-blue) ![Vite](https://img.shields.io/badge/Vite-4.5.3-green) ![License](https://img.shields.io/badge/License-MIT-yellow)

## 🎓 What You'll Learn

- **Relative Sizing Fundamentals** - Understand why story points work better than time estimates
- **Fibonacci Sequence Application** - Learn why 1, 2, 3, 5, 8, 13 creates better estimates
- **Complexity vs. Effort** - Distinguish between different factors that affect story sizing
- **Team Consistency** - Build shared understanding for reliable velocity planning

## 🚀 Features

### Exercise 1: Abstract Comparisons
- Interactive drag-and-drop interface using geometric shapes
- Learn relative sizing with abstract items (grain of sand → mountain)
- Immediate feedback with explanations
- Foundation building for story point concepts

### Exercise 2: User Stories
- Real-world user story estimation practice
- Fibonacci sequence story point assignment (1, 2, 3, 5, 8, 13)
- Detailed feedback covering complexity, effort, and uncertainty factors
- Progressive difficulty with practical examples

### Exercise 3: Core Principles Recap
- Interactive true/false quiz (8 questions)
- Comprehensive learning summary
- Performance tracking and results analysis
- Reinforcement of key concepts learned

### Navigation & Progress
- Smart progress tracking with completion badges
- Sequential exercise unlocking
- Visual progress indicators
- Smooth transitions and animations

## 🛠️ Tech Stack

- **Frontend**: React 18.2.0 with modern hooks
- **Build Tool**: Vite 4.5.3 for fast development
- **Drag & Drop**: @dnd-kit for accessible interactions
- **Styling**: Modern CSS with gradients and animations
- **State Management**: React useState for component state
- **Responsive Design**: Mobile-first approach

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

1. **Start with Exercise 1**: Learn relative sizing fundamentals with abstract shapes
2. **Progress to Exercise 2**: Apply concepts to real user stories
3. **Complete Exercise 3**: Test your knowledge and review key principles
4. **Track Progress**: Monitor completion through the navigation panel

Each exercise builds upon the previous one, creating a comprehensive learning experience.

## 🏗️ Project Structure

```
src/
├── components/
│   ├── Exercise1.jsx          # Abstract comparisons exercise
│   ├── Exercise1.css
│   ├── Exercise2.jsx          # User stories exercise
│   ├── Exercise2.css
│   ├── Exercise3.jsx          # Quiz and recap exercise
│   ├── Exercise3.css
│   ├── Header.jsx             # Application header
│   ├── Header.css
│   ├── Navigation.jsx         # Progress tracking navigation
│   ├── Navigation.css
│   └── Exercise.css           # Shared exercise styles
├── App.jsx                    # Main application component
├── App.css                    # Global styles
└── main.jsx                   # Application entry point
```

## 🎨 Design Philosophy

- **Minimalist UI**: Clean, distraction-free learning environment
- **Progressive Disclosure**: Information revealed as needed
- **Immediate Feedback**: Real-time learning reinforcement
- **Accessibility**: Keyboard navigation and screen reader support
- **Mobile Responsive**: Works seamlessly across devices

## 🧪 Testing

A comprehensive test checklist is available in `test-functionality.md` covering:
- Drag and drop functionality
- Quiz interactions
- Navigation flow
- Progress tracking
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

- Uses Vite's Hot Module Replacement for instant updates
- ESLint configured for React best practices
- CSS modules for component-scoped styling
- Modern JavaScript (ES2022) features

## 📚 Educational Approach

The application follows proven educational principles:
- **Learning by Doing**: Hands-on interactive exercises
- **Immediate Feedback**: Instant validation and explanation
- **Progressive Complexity**: Building from simple to complex concepts
- **Spaced Repetition**: Key concepts reinforced across exercises
- **Visual Learning**: Drag-and-drop and visual representations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with React and Vite for modern web development
- Uses @dnd-kit for accessible drag-and-drop interactions
- Inspired by agile estimation best practices
- Designed for practical learning and skill building

---

**Ready to master story point estimation?** Start your learning journey today! 🎯
