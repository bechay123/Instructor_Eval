# AI Analysis Feature Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Instructor Dashboard                         │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              AI Analysis Tab                            │    │
│  │                                                         │    │
│  │  [Generate Analysis Button]                            │    │
│  │         ↓                                               │    │
│  │  handleGenerateAIAnalysis()                            │    │
│  │         ↓                                               │    │
│  │  Collect evaluation data:                              │    │
│  │  - Ratings (15 criteria)                               │    │
│  │  - Comments (4 types)                                  │    │
│  │  - Metrics (totals, averages)                          │    │
│  └────────────────────────────────────────────────────────┘    │
│                      ↓                                           │
└──────────────────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│                  OpenAI Service                                  │
│              (src/services/openai-service.ts)                   │
│                                                                  │
│  generateAIAnalysis(evaluationData)                             │
│         ↓                                                        │
│  Format data for AI:                                            │
│  - Category averages                                            │
│  - Detailed ratings breakdown                                   │
│  - All student comments                                         │
│         ↓                                                        │
│  Send to OpenAI API (GPT-4o-mini)                               │
│         ↓                                                        │
│  Receive structured JSON response                               │
│         ↓                                                        │
│  Return AIAnalysisResult                                        │
└─────────────────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│                    OpenAI API                                    │
│              (https://api.openai.com)                           │
│                                                                  │
│  Model: GPT-4o-mini                                             │
│  Temperature: 0.7                                               │
│  Max Tokens: 1500                                               │
│                                                                  │
│  System Prompt: Educational evaluation expert                   │
│  User Prompt: Evaluation data + request for analysis           │
│                                                                  │
│  → Analyzes feedback                                            │
│  → Identifies patterns                                          │
│  → Generates insights                                           │
│  → Returns structured JSON                                      │
└─────────────────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│              AI Analysis Display (UI)                            │
│                                                                  │
│  ┌─────────────────────────────────────────────┐               │
│  │  📊 Executive Summary                        │               │
│  │  Brief overview of performance               │               │
│  └─────────────────────────────────────────────┘               │
│                                                                  │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                          │
│  │Overall│ │Teach │ │Mater │ │Comm  │ Sentiment Cards          │
│  │  👍   │ │  👍  │ │  ⚠️  │ │  👍  │                          │
│  └──────┘ └──────┘ └──────┘ └──────┘                          │
│                                                                  │
│  ┌─────────────────────────────────────────────┐               │
│  │  ✓ Key Strengths (Green)                    │               │
│  │  • Strength 1                                │               │
│  │  • Strength 2                                │               │
│  │  • Strength 3                                │               │
│  └─────────────────────────────────────────────┘               │
│                                                                  │
│  ┌─────────────────────────────────────────────┐               │
│  │  → Areas for Improvement (Orange)           │               │
│  │  • Area 1                                    │               │
│  │  • Area 2                                    │               │
│  │  • Area 3                                    │               │
│  └─────────────────────────────────────────────┘               │
│                                                                  │
│  ┌─────────────────────────────────────────────┐               │
│  │  💡 Recommendations (Blue)                  │               │
│  │  • Action 1                                  │               │
│  │  • Action 2                                  │               │
│  │  • Action 3                                  │               │
│  └─────────────────────────────────────────────┘               │
│                                                                  │
│  ┌─────────────────────────────────────────────┐               │
│  │  🧠 Key Themes (Purple)                     │               │
│  │  [Theme 1] [Theme 2] [Theme 3]              │               │
│  └─────────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Sequence

```
Instructor → Dashboard → AI Tab → Click Button
                                      ↓
                              Collect Evaluation Data
                                      ↓
                              ┌─────────────────┐
                              │  Evaluation Data │
                              │                  │
                              │  • 15 ratings    │
                              │  • Comments      │
                              │  • Metrics       │
                              └─────────────────┘
                                      ↓
                              OpenAI Service
                                      ↓
                              Format for AI
                              (Readable summary)
                                      ↓
                              OpenAI API Call
                              (GPT-4o-mini)
                                      ↓
                              AI Processing
                              • Sentiment analysis
                              • Pattern recognition
                              • Insight generation
                                      ↓
                              JSON Response
                              ┌─────────────────┐
                              │ AIAnalysisResult│
                              │                  │
                              │ • summary        │
                              │ • strengths      │
                              │ • improvements   │
                              │ • recommendations│
                              │ • sentiment      │
                              │ • themes         │
                              └─────────────────┘
                                      ↓
                              Update React State
                                      ↓
                              Render Beautiful UI
                                      ↓
                              Instructor Views Insights! 🎉
```

## Component State Management

```typescript
// AI Analysis State
const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
const [aiLoading, setAiLoading] = useState(false);
const [aiError, setAiError] = useState<string | null>(null);

// State Transitions
Initial: { aiAnalysis: null, aiLoading: false, aiError: null }
   ↓ (User clicks "Generate Analysis")
Loading: { aiAnalysis: null, aiLoading: true, aiError: null }
   ↓ (API success)
Success: { aiAnalysis: {...}, aiLoading: false, aiError: null }
   ↓ (API error)
Error: { aiAnalysis: null, aiLoading: false, aiError: "..." }
```

## Security Considerations

```
Current Setup (Development):
┌─────────────┐
│   Browser   │ ──── API Key ────→ ┌──────────┐
│  (Frontend) │                     │  OpenAI  │
└─────────────┘                     └──────────┘
    ⚠️ API key exposed in frontend bundle

Recommended Setup (Production):
┌─────────────┐                  ┌──────────┐
│   Browser   │ ──── Request ──→ │  Backend │
│  (Frontend) │                  │   API    │
└─────────────┘                  └──────────┘
                                      ↓
                                API Key (secure)
                                      ↓
                                ┌──────────┐
                                │  OpenAI  │
                                └──────────┘
    ✅ API key secure on server
```

## Cost Optimization Strategy

```
┌─────────────────────────────────────────────────┐
│           Cost Optimization Flow                 │
│                                                  │
│  1. Check Cache                                 │
│     ↓ (not found)                               │
│  2. Generate Analysis                           │
│     ↓ (success)                                 │
│  3. Store in Database/Cache                     │
│     ↓                                            │
│  4. Return to User                              │
│                                                  │
│  Next Request:                                  │
│  1. Check Cache                                 │
│     ↓ (found!)                                  │
│  2. Return Cached Result ✅                     │
│     (No API call = No cost)                     │
└─────────────────────────────────────────────────┘
```

## File Structure

```
instructor-eval/
├── .env                          # API keys (git-ignored)
├── .env.example                  # Template
├── src/
│   ├── services/
│   │   └── openai-service.ts    # OpenAI integration
│   └── pages/
│       └── instructor-dashboard-dynamic.tsx  # UI implementation
├── AI_ANALYSIS_GUIDE.md         # Full documentation
├── AI_IMPLEMENTATION_SUMMARY.md # Implementation details
├── QUICKSTART_AI.md             # Quick start guide
└── AI_ARCHITECTURE.md           # This file
```

## Technology Stack

```
┌─────────────────────────────────────────────────┐
│              Technology Layers                   │
│                                                  │
│  ┌─────────────────────────────────────────┐   │
│  │        Presentation Layer               │   │
│  │  React 19 + TypeScript + Tailwind CSS   │   │
│  │  shadcn/ui + Lucide Icons               │   │
│  └─────────────────────────────────────────┘   │
│                    ↓                             │
│  ┌─────────────────────────────────────────┐   │
│  │         State Management                │   │
│  │  React Hooks (useState, useEffect)      │   │
│  └─────────────────────────────────────────┘   │
│                    ↓                             │
│  ┌─────────────────────────────────────────┐   │
│  │        Service Layer                    │   │
│  │  OpenAI Service (openai-service.ts)     │   │
│  └─────────────────────────────────────────┘   │
│                    ↓                             │
│  ┌─────────────────────────────────────────┐   │
│  │         External API                    │   │
│  │  OpenAI GPT-4o-mini                     │   │
│  └─────────────────────────────────────────┘   │
│                    ↓                             │
│  ┌─────────────────────────────────────────┐   │
│  │          Data Layer                     │   │
│  │  Supabase (PostgreSQL)                  │   │
│  │  - evaluations table                    │   │
│  │  - evaluation_ratings table             │   │
│  │  - evaluation_comments table            │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

## Future Enhancements

```
Phase 1 (Current): ✅ COMPLETE
├── Basic AI analysis
├── Frontend integration
└── Documentation

Phase 2 (Planned):
├── Backend API endpoint
├── Analysis caching
├── Rate limiting
└── User quotas

Phase 3 (Future):
├── Historical trend analysis
├── Comparative analytics
├── PDF export
├── Email digests
└── Multi-language support

Phase 4 (Advanced):
├── Custom AI prompts
├── Department benchmarking
├── Predictive analytics
└── LMS integration
```

---

This architecture supports the current implementation while being designed for future scalability and enhancement.
