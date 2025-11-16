# Translation Feature Setup Guide

This guide explains how to set up and use the translation feature for student evaluation comments.

## Overview

The translation feature allows students to write evaluation comments in their preferred language (English, Tagalog, Cebuano, Hiligaynon, or Maranao), and automatically translates them to English for instructors to read.

## Features

- **5 Language Support**: English, Tagalog, Cebuano, Hiligaynon, Maranao
- **Bilingual Storage**: Stores both original (student's language) and translated (English) versions
- **Smart Display**: Shows both versions to instructors with clear labeling
- **Graceful Fallback**: If translation API fails, displays original text with language label

## Setup Instructions

### 1. Database Migration

Run the SQL migration to add bilingual comment columns:

```bash
# In Supabase SQL Editor, run:
c:\Users\Teacher\Desktop\instructor-eval\06_add_bilingual_comments.sql
```

This adds the following columns to the `evaluations` table:
- `teaching_comments_original` (TEXT)
- `teaching_comments_language` (VARCHAR)
- `materials_comments_original` (TEXT)
- `materials_comments_language` (VARCHAR)
- `communication_comments_original` (TEXT)
- `communication_comments_language` (VARCHAR)
- `general_comments_original` (TEXT)
- `general_comments_language` (VARCHAR)

### 2. Google Cloud Translation API Setup

#### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable billing (required for API access, but free tier is generous)

#### Step 2: Enable Translation API
1. Navigate to "APIs & Services" > "Library"
2. Search for "Cloud Translation API"
3. Click "Enable"

#### Step 3: Create API Key
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API key
4. (Recommended) Click "Restrict Key" and limit to Translation API only

#### Step 4: Add API Key to Environment
Create or update `.env` file in project root:

```env
VITE_GOOGLE_TRANSLATE_API_KEY=your_api_key_here
```

**IMPORTANT**: Never commit `.env` file to version control!

Add to `.gitignore`:
```
.env
.env.local
```

### 3. Alternative Translation APIs

If you prefer not to use Google Translate API, you can modify `src/lib/translator.ts` to use:

#### Microsoft Translator Text API
```typescript
const response = await fetch(
  'https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=en',
  {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': import.meta.env.VITE_AZURE_TRANSLATOR_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([{ text: text }])
  }
);
```

#### AWS Translate
```typescript
import { TranslateClient, TranslateTextCommand } from "@aws-sdk/client-translate";

const client = new TranslateClient({ region: "us-east-1" });
const command = new TranslateTextCommand({
  Text: text,
  SourceLanguageCode: sourceLanguage,
  TargetLanguageCode: "en"
});
const response = await client.send(command);
```

## Usage

### For Students

1. Navigate to the evaluation form
2. Fill out the ratings as usual
3. For each comment field, select your preferred language from the dropdown
4. Write your comments in your selected language
5. The placeholder text will update to match your language choice
6. Submit the evaluation - translation happens automatically

### For Instructors

1. View evaluation results in your dashboard
2. Comments are displayed in two sections:
   - **Translated to English**: The English translation (highlighted in blue)
   - **Original (Language Name)**: The student's original comment (highlighted in gray)
3. Both versions are shown for transparency and context

## Testing Without API Key

The system will work even without an API key configured:
- Comments will be stored with language prefix: `[Original in Tagalog]: <comment>`
- Both original and "translated" versions will be the same
- You can test the UI and functionality before setting up the API

## Language Codes

| Language | Code | Native Name |
|----------|------|-------------|
| English | en | English |
| Tagalog | tl | Tagalog |
| Cebuano | ceb | Cebuano |
| Hiligaynon | hil | Hiligaynon |
| Maranao | mrw | Mëranaw |

## Cost Considerations

### Google Cloud Translation API Pricing (as of 2024)
- **Free Tier**: $10/month credit (translates ~500,000 characters)
- **After Free Tier**: $20 per million characters
- **Average Comment**: ~200 characters
- **Monthly Usage Example**: 1000 evaluations × 4 comments × 200 chars = 800,000 chars = ~$1.60/month

### Microsoft Translator
- **Free Tier**: 2 million characters/month
- **After Free Tier**: $10 per million characters

### AWS Translate
- **Free Tier**: 2 million characters/month for 12 months
- **After Free Tier**: $15 per million characters

## Troubleshooting

### Translation API Not Working
1. Check if API key is correctly set in `.env`
2. Verify the API is enabled in Google Cloud Console
3. Check browser console for error messages
4. Ensure billing is enabled on Google Cloud project

### Comments Not Saving Original Language
1. Verify database migration was run successfully
2. Check browser network tab for API response errors
3. Ensure form is passing all required fields in submission

### Display Issues
1. Clear browser cache
2. Check if `BilingualComment` component is imported
3. Verify comment data includes `_original` and `_language` fields

## Files Modified

- `src/lib/translator.ts` - Translation service with API integration
- `src/components/evaluation-form.tsx` - Language selector and submission logic
- `src/components/bilingual-comment.tsx` - Display component for comments
- `src/pages/instructor-dashboard-dynamic.tsx` - Updated to show bilingual comments
- `06_add_bilingual_comments.sql` - Database migration script

## Future Enhancements

- Auto-detect language instead of requiring selection
- Cache translations to reduce API calls
- Add more Philippine languages (Ilocano, Waray, etc.)
- Export evaluation reports with both language versions
- Language preference persistence (remember student's choice)

## Support

For issues or questions:
1. Check console logs for error messages
2. Verify API key is valid and has correct permissions
3. Ensure database migration completed successfully
4. Test with English first to isolate translation-specific issues
