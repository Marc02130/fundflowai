# Tech Stack Requirements

## Core Technologies

### Frontend
- React 19.0.0
- React Router 7.2.0
- TypeScript 5.7.2
- Tailwind CSS 4.0.0
- Vite 5.4.11 (Build tool)

### Backend & Database
- Supabase (Backend as a Service)
  - PostgreSQL Database
  - Row Level Security (RLS)
  - Real-time subscriptions
  - Storage for file uploads
  - Authentication & Authorization

### Authentication
- Supabase Auth
  - Email/Password authentication
  - OAuth providers (if needed)
  - JWT token management
  - Session handling

### Deployment
- AWS Amplify
  - CI/CD pipeline
  - Hosting
  - Environment management
  - Domain configuration

## Development Environment

### Node.js Requirements
- Node.js version: 20.x
- Package manager: npm/yarn/pnpm

### Required Environment Variables
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development Tools
- VS Code (recommended)
- ESLint for code quality
- Prettier for code formatting
- React DevTools
- Supabase CLI for local development

## Key Dependencies

### Production Dependencies
```json
{
  "@react-router/node": "^7.2.0",
  "@react-router/serve": "^7.2.0",
  "@supabase/supabase-js": "^2.49.1",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "react-router": "^7.2.0"
}
```

### Development Dependencies
```json
{
  "@react-router/dev": "^7.2.0",
  "@tailwindcss/vite": "^4.0.0",
  "@types/node": "^20",
  "@types/react": "^19.0.1",
  "@types/react-dom": "^19.0.1",
  "tailwindcss": "^4.0.0",
  "typescript": "^5.7.2",
  "vite": "^5.4.11"
}
```

## Database Requirements
- PostgreSQL 15+
- PostGIS extensions (if needed for future geospatial features)
- pgvector extensions (if needed for future AI features)

## Performance Requirements
- Initial page load < 2s
- Time to Interactive < 3s
- Core Web Vitals meeting "Good" thresholds
- Responsive design for all screen sizes

## Security Requirements
- HTTPS only
- JWT token-based authentication
- Row Level Security (RLS) policies for all tables
- Secure file upload handling
- XSS protection
- CSRF protection

## Browser Support
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome for Android)

## Monitoring & Analytics
- Error tracking
- Performance monitoring
- User analytics
- Database query performance

## Development Workflow
1. Local development using Vite dev server
2. Testing with React Testing Library
3. Code quality checks with ESLint
4. Code formatting with Prettier
5. Git version control
6. CI/CD through AWS Amplify

## Future Considerations
- Server-side rendering (SSR) if needed
- PWA capabilities
- Internationalization (i18n)
- Accessibility compliance (WCAG 2.1)
- Mobile app development using React Native
