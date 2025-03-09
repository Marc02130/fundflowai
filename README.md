# Fund Flow AI

AI-assisted grant writing and management platform.

## Overview

Fund Flow AI streamlines the grant application process using AI assistance for content generation, refinement, and visualization. The platform integrates with Supabase for data storage and AWS Amplify for deployment.

## Features

- 🤖 AI-assisted content generation
- 📝 Rich text editing
- 🖼️ AI visualization generation
- 📋 Grant application management
- 👥 Multi-user collaboration
- 🔄 Real-time updates
- 📱 Responsive design
- 🎨 Modern UI with TailwindCSS

## Tech Stack

- React + TypeScript
- Supabase (Database & Auth)
- AWS Amplify (Hosting)
- TailwindCSS (Styling)
- OpenAI (AI Services)

## Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account
- AWS account
- OpenAI API key

## Local Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/fundflowai.git
cd fundflowai
```

2. **Install dependencies**
```bash
npm install
# or
pnpm install
```

3. **Configure environment variables**
```bash
cp .env.example .env.local
```

Required variables:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=your_openai_model
```

4. **Start development server**
```bash
npm run dev
# or
pnpm dev
```

## Supabase Setup

1. **Create Supabase Project**
   - Go to [Supabase Dashboard](https://app.supabase.io)
   - Click "New Project"
   - Fill in project details

2. **Database Setup**
   - Navigate to SQL Editor
   - Run migrations from `/supabase/migrations` in order
   - Verify tables and functions are created

3. **Authentication Setup**
   - Enable Email/Password sign-up
   - Configure OAuth providers (optional)
   - Set up email templates

4. **Storage Setup**
   - Create 'grant-attachments' bucket
   - Configure CORS policies
   - Set up storage rules

5. **Edge Functions**
   - Deploy functions from `/supabase/functions`:
```bash
supabase functions deploy generate-grant
supabase functions deploy prompt-ai
supabase functions deploy create-visuals
supabase functions deploy review-edits
```

## AWS Amplify Deployment

1. **Install Amplify CLI**
```bash
npm install -g @aws-amplify/cli
amplify configure
```

2. **Initialize Amplify**
```bash
amplify init
```

3. **Configure Build Settings**
Create `amplify.yml`:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

4. **Environment Variables**
Configure in Amplify Console:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- OPENAI_API_KEY
- OPENAI_MODEL

5. **Deploy**
   - Connect repository in Amplify Console
   - Select main/master branch
   - Review and deploy

6. **Domain Setup (Optional)**
   - Add custom domain in Amplify Console
   - Configure DNS settings
   - Enable HTTPS

## Production Considerations

### Security
- Enable RLS policies in Supabase
- Configure proper CORS settings
- Set up proper IAM roles
- Enable audit logging

### Performance
- Configure caching rules
- Enable CDN
- Optimize asset delivery
- Monitor API limits

### Monitoring
- Set up AWS CloudWatch
- Configure Supabase monitoring
- Enable error tracking
- Monitor API usage

## Troubleshooting

### Common Issues
1. **Database Connection**
   - Verify connection strings
   - Check RLS policies
   - Validate permissions

2. **Deployment Failures**
   - Check build logs
   - Verify environment variables
   - Validate dependencies

3. **Function Timeouts**
   - Check function logs
   - Monitor execution time
   - Optimize operations

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## Support

For support:
- Open an issue
- Check documentation
- Contact development team
