# Contributing to PERN Dashboard

Thank you for considering contributing to the PERN Dashboard project! This document provides guidelines for contributing.

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/PERN-Task1.git`
3. Follow the setup instructions in [README.md](README.md)
4. Create a new branch: `git checkout -b feature/your-feature-name`

## Code Style Guidelines

### Backend (Node.js)
- Use ES6+ syntax
- Use `const` and `let` instead of `var`
- Use async/await for asynchronous operations
- Add error handling for all database operations
- Keep functions small and focused
- Use meaningful variable and function names

### Frontend (React)
- Use functional components with Hooks
- Use `useCallback` and `useMemo` for optimization when needed
- Keep components modular and reusable
- Follow React best practices
- Use meaningful component and variable names

### Database
- Follow PostgreSQL naming conventions
- Use snake_case for table and column names
- Add indexes for frequently queried columns
- Use foreign key constraints for referential integrity

## Project Structure

```
PERN-Task1/
├── backend/
│   ├── db.js              # Database connection configuration
│   ├── index.js           # Express server and API routes
│   ├── schema.sql         # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── App.css        # Styles
│   │   └── index.js       # React entry point
│   └── package.json
└── README.md
```

## Making Changes

### Backend Changes

1. **Adding New API Endpoints**:
   - Add route in `backend/index.js`
   - Follow RESTful conventions
   - Add proper error handling
   - Test with sample data

2. **Database Changes**:
   - Update `backend/schema.sql`
   - Test migration on a clean database
   - Document changes

### Frontend Changes

1. **UI Changes**:
   - Update components in `frontend/src/App.js`
   - Update styles in `frontend/src/App.css`
   - Test in different browsers
   - Ensure responsive design

2. **API Integration**:
   - Use axios for API calls
   - Add proper error handling
   - Show user feedback for operations

## Testing

Before submitting your pull request:

1. **Backend Testing**:
   ```bash
   cd backend
   npm start
   ```
   - Test all API endpoints
   - Verify database operations
   - Check error handling

2. **Frontend Testing**:
   ```bash
   cd frontend
   npm start
   ```
   - Test all CRUD operations
   - Verify search functionality
   - Check form validations
   - Test in different screen sizes

3. **Integration Testing**:
   - Test the complete flow
   - Verify data persistence
   - Check relational data handling

## Pull Request Process

1. Update documentation if needed
2. Ensure your code follows the style guidelines
3. Test your changes thoroughly
4. Commit with clear, descriptive messages
5. Push to your fork
6. Create a pull request with:
   - Clear title describing the change
   - Detailed description of what was changed and why
   - Screenshots for UI changes
   - Reference any related issues

## Commit Message Guidelines

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- First line should be 50 characters or less
- Reference issues and pull requests when relevant

Examples:
```
Add search functionality to banking section
Fix bug in personal details form validation
Update README with Docker instructions
```

## Feature Requests

If you have ideas for new features:

1. Check existing issues to avoid duplicates
2. Open a new issue with the "enhancement" label
3. Provide detailed description and use cases
4. Be open to discussion and feedback

## Bug Reports

When reporting bugs:

1. Use a clear and descriptive title
2. Describe the exact steps to reproduce
3. Provide specific examples
4. Describe the expected vs actual behavior
5. Include screenshots if applicable
6. Mention your environment (OS, Node version, etc.)

## Questions?

Feel free to open an issue for any questions about contributing!

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).
