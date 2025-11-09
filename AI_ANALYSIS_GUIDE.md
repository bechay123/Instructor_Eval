# AI Analysis Integration Guide

This guide explains how to set up and use the AI-powered analysis feature for instructor evaluations.

## Prerequisites

- Node.js and npm installed
- An OpenAI API account
- Active student evaluations in the system

## Setup Instructions

### 1. Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to **API Keys** section
4. Click **"Create new secret key"**
5. Copy the generated API key (you won't be able to see it again!)

### 2. Configure Environment Variables

1. Open the `.env` file in the root directory of the project
2. Replace `your_openai_api_key_here` with your actual OpenAI API key:

```env
VITE_OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

3. Save the file

### 3. Install Dependencies

If you haven't already, install the required packages:

```bash
npm install
```

The `openai` package should already be installed. If not, run:

```bash
npm install openai
```

### 4. Start the Development Server

```bash
npm run dev
```

## Using the AI Analysis Feature

### Accessing AI Analysis

1. Log in as an **Instructor**
2. Navigate to your **Instructor Dashboard**
3. Select a course from the dropdown (if you have multiple courses)
4. Click on the **"AI Analysis"** tab
5. Click the **"Generate Analysis"** button

### What the AI Analyzes

The AI will analyze:

- **Overall Ratings**: Total evaluations, overall rating, and response rate
- **Category Performance**: Teaching, Materials, and Communication ratings
- **Detailed Ratings**: All 15 individual rating criteria
- **Student Comments**: All written feedback from students

### AI Analysis Output

The AI provides:

1. **Executive Summary**: A brief overview of your teaching performance
2. **Sentiment Analysis**: Overall and category-specific sentiment (positive/neutral/negative)
3. **Key Strengths**: Your top strengths based on student feedback
4. **Areas for Improvement**: Constructive areas where you can enhance
5. **Actionable Recommendations**: Specific steps you can take to improve
6. **Key Themes**: Common themes identified across student feedback

### Example Output

```json
{
  "summary": "The instructor demonstrates strong subject knowledge and engagement but could improve on providing more timely feedback...",
  "strengths": [
    "Excellent subject matter expertise and clarity",
    "High level of student engagement",
    "Well-organized course materials"
  ],
  "areasForImprovement": [
    "Faster turnaround time on assignment feedback",
    "More diverse learning materials",
    "Improved availability during office hours"
  ],
  "recommendations": [
    "Consider setting specific feedback timelines",
    "Incorporate multimedia resources",
    "Add virtual office hours via Zoom"
  ],
  "sentimentAnalysis": {
    "overall": "positive",
    "teaching": "positive",
    "materials": "neutral",
    "communication": "positive"
  },
  "keyThemes": [
    "Expertise",
    "Engagement",
    "Feedback timeliness",
    "Accessibility"
  ]
}
```

## Important Notes

### Security Considerations

⚠️ **WARNING**: The current implementation uses `dangerouslyAllowBrowser: true` in the OpenAI client configuration. This is **NOT recommended for production**.

**For Production Use**:
1. Create a backend API endpoint (e.g., using Node.js/Express, Supabase Edge Functions, or Vercel serverless functions)
2. Move the OpenAI API calls to the backend
3. Never expose your API key in the frontend code
4. Implement proper authentication and rate limiting

### Cost Considerations

- Each AI analysis uses OpenAI's API, which incurs costs
- The feature uses the `gpt-4o-mini` model for cost efficiency
- Typical cost per analysis: ~$0.01 - $0.05 (depending on comment length)
- Monitor your OpenAI usage at: https://platform.openai.com/usage

### Rate Limits

- OpenAI has rate limits based on your account tier
- If you get rate limit errors, wait a few moments before trying again
- Consider implementing caching to avoid redundant API calls

### Data Privacy

- Student comments are sent to OpenAI for analysis
- Ensure compliance with your institution's privacy policies
- Consider anonymizing data before sending to external APIs
- Review OpenAI's data usage policy: https://openai.com/policies/privacy-policy

## Troubleshooting

### "Failed to generate AI analysis"

**Possible causes**:
1. Invalid or missing API key
2. Insufficient OpenAI credits
3. Rate limit exceeded
4. Network connectivity issues

**Solutions**:
- Verify your API key in the `.env` file
- Check your OpenAI account balance
- Wait a few minutes and try again
- Check browser console for detailed error messages

### "No evaluation data available to analyze"

**Cause**: No submitted evaluations for the selected course

**Solution**: Ensure students have submitted evaluations for the course

### API Key Not Found

**Cause**: Environment variable not loaded

**Solution**: 
1. Restart the development server after adding the `.env` file
2. Ensure the `.env` file is in the root directory
3. Verify the variable name is `VITE_OPENAI_API_KEY`

## Future Enhancements

Planned improvements:
- [ ] Backend API integration for improved security
- [ ] Caching of AI analyses to reduce costs
- [ ] Historical trend analysis across semesters
- [ ] PDF export of AI reports
- [ ] Comparison with department/institution averages
- [ ] Multi-language support for international students

## Support

For issues or questions:
1. Check the browser console for error messages
2. Review OpenAI API status: https://status.openai.com/
3. Verify your OpenAI account settings

## Additional Resources

- [OpenAI API Documentation](https://platform.openai.com/docs/)
- [OpenAI Pricing](https://openai.com/pricing)
- [OpenAI API Best Practices](https://platform.openai.com/docs/guides/production-best-practices)
