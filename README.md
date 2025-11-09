# Instructor Evaluation System

A comprehensive web application for managing and analyzing instructor evaluations, built with React, TypeScript, Vite, and Supabase.

## 🚀 Features

- **Student Dashboard**: Submit evaluations for enrolled courses
- **Instructor Dashboard**: View evaluation results and analytics
- **Admin Dashboard**: Manage users, courses, and system settings
- **AI-Powered Analysis**: Get intelligent insights from student feedback using OpenAI
- **Real-time Updates**: Powered by Supabase for instant data synchronization
- **Secure Authentication**: Role-based access control (Student, Instructor, Admin)
- **Responsive Design**: Beautiful UI with Tailwind CSS and shadcn/ui components

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- OpenAI API account (for AI analysis feature)

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd instructor-eval
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration (for AI Analysis)
VITE_OPENAI_API_KEY=your_openai_api_key
```

4. **Set up the database**

Follow the instructions in `SUPABASE_SETUP.md` to set up your Supabase database.

5. **Start the development server**
```bash
npm run dev
```

## 🤖 AI Analysis Feature

This application includes an AI-powered analysis feature that uses OpenAI to provide intelligent insights from student evaluations.

**Key Features**:
- Executive summary of teaching performance
- Sentiment analysis (positive/neutral/negative)
- Identification of key strengths
- Areas for improvement
- Actionable recommendations
- Key themes from student feedback

**Setup Guide**: See [AI_ANALYSIS_GUIDE.md](./AI_ANALYSIS_GUIDE.md) for detailed setup instructions.

⚠️ **Note**: The AI feature requires an OpenAI API key and incurs usage costs based on OpenAI's pricing.

## 📚 Documentation

- [Supabase Setup Guide](./SUPABASE_SETUP.md)
- [Login & Registration Setup](./LOGIN_REGISTRATION_SETUP.md)
- [Dynamic Setup Guide](./DYNAMIC_SETUP_GUIDE.md)
- [AI Analysis Guide](./AI_ANALYSIS_GUIDE.md)

## 🏗️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **UI Components**: shadcn/ui, Radix UI
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **AI**: OpenAI GPT-4o-mini
- **Icons**: Lucide React
- **Routing**: React Router

## 📂 Project Structure

```
instructor-eval/
├── src/
│   ├── components/       # Reusable UI components
│   ├── context/         # React context providers
│   ├── lib/             # Utility functions
│   ├── pages/           # Page components
│   ├── services/        # API services (OpenAI, etc.)
│   └── assets/          # Static assets
├── public/              # Public assets
├── *.sql                # Database setup scripts
└── *.md                 # Documentation
```

## 🎯 User Roles

### Student
- View enrolled courses
- Submit course evaluations
- Rate instructors on multiple criteria
- Provide written feedback

### Instructor
- View courses taught
- Access evaluation results
- Analyze student feedback
- Generate AI-powered insights
- Manage course enrollment

### Admin
- Manage user accounts
- Monitor system activity
- Configure academic terms
- Oversee all evaluations

## 🔒 Security Notes

- Never commit `.env` files to version control
- For production, move OpenAI API calls to a secure backend
- Implement rate limiting for AI analysis
- Review and comply with data privacy regulations
- Follow Supabase Row Level Security best practices

## 🚀 Deployment

For production deployment:

1. Build the application:
```bash
npm run build
```

2. Deploy to your preferred hosting platform (Vercel, Netlify, etc.)

3. **Important**: Migrate OpenAI API calls to a backend service for security

4. Set environment variables in your hosting platform

## 🐛 Troubleshooting

### AI Analysis Issues
- Verify OpenAI API key is correct
- Check OpenAI account credits
- Review browser console for errors
- See [AI_ANALYSIS_GUIDE.md](./AI_ANALYSIS_GUIDE.md)

### Database Issues
- Verify Supabase credentials
- Check Row Level Security policies
- Review SQL setup scripts

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
