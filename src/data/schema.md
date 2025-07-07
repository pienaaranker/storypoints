# Exercise Data JSON Schema

## Overview
This document defines the JSON schema for the story point estimation exercise system. The data is organized into separate JSON files for maintainability and modularity.

## File Structure
```
src/data/
├── exercises.json          # Exercise metadata and configuration
├── exercise1-items.json    # Abstract items for Exercise 1
├── exercise2-stories.json  # User stories for Exercise 2
├── exercise3-questions.json # Quiz questions for Exercise 3
└── schema.md              # This documentation
```

## Schema Definitions

### exercises.json
Contains metadata for all exercises, UI text, and configuration.

```json
{
  "metadata": {
    "version": "1.0.0",
    "lastUpdated": "2025-01-07"
  },
  "exercises": [
    {
      "id": 1,
      "title": "Abstract Comparisons",
      "description": "Learn relative sizing with abstract items",
      "details": "Start with simple abstract concepts...",
      "type": "sorting_and_pointing",
      "config": {
        "allowShuffle": true,
        "showMindsetReminder": true,
        "pointScale": [1, 2, 3, 5, 8, 13]
      },
      "ui": {
        "startScreen": {
          "instructions": "You'll be presented with abstract items...",
          "buttonText": "Start Exercise"
        },
        "mindsetReminder": "Remember: Story points are about relative effort..."
      }
    }
  ]
}
```

### exercise1-items.json
Abstract items for the first exercise.

```json
{
  "metadata": {
    "exerciseId": 1,
    "type": "abstract_items",
    "version": "1.0.0"
  },
  "items": [
    {
      "id": "grain-of-sand",
      "name": "A grain of sand",
      "description": "Tiny, lightweight, easily moved",
      "correctOrder": 1,
      "correctPoints": 1,
      "explanation": "Minimal effort required - can be moved with a gentle breath or touch."
    }
  ]
}
```

### exercise2-stories.json
User stories for the second exercise.

```json
{
  "metadata": {
    "exerciseId": 2,
    "type": "user_stories",
    "version": "1.0.0"
  },
  "stories": [
    {
      "id": "view-profile",
      "title": "View User Profile",
      "description": "As a user, I want to view my profile information...",
      "acceptanceCriteria": [
        "Display user name, email, and profile picture",
        "Show account creation date"
      ],
      "correctOrder": 1,
      "correctPoints": 2,
      "factors": {
        "complexity": "Low",
        "effort": "Low",
        "uncertainty": "Low"
      },
      "explanation": "Simple read operation with basic UI display..."
    }
  ]
}
```

### exercise3-questions.json
Quiz questions for the third exercise.

```json
{
  "metadata": {
    "exerciseId": 3,
    "type": "quiz_questions",
    "version": "1.0.0"
  },
  "questions": [
    {
      "id": "relative-sizing",
      "question": "Story points are about relative sizing, not absolute time estimation.",
      "answer": true,
      "explanation": "Correct! Story points compare the relative effort/complexity...",
      "category": "Core Concept"
    }
  ]
}
```

## Benefits of This Structure

1. **Maintainability**: Easy to add/modify exercises without touching code
2. **Modularity**: Each exercise's data is in its own file
3. **Versioning**: Metadata tracks versions for data migration
4. **Validation**: Clear schema enables data validation
5. **Extensibility**: Easy to add new exercise types or properties
6. **Localization Ready**: Structure supports future i18n needs
