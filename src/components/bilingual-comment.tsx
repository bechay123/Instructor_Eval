import { Badge } from "./ui/badge"
import { languages } from "../lib/translator"

interface BilingualCommentProps {
  title: string;
  translatedText: string;
  originalText?: string;
  languageCode?: string;
}

/**
 * Component to display evaluation comments with both original and translated versions
 */
export function BilingualComment({ 
  title, 
  translatedText, 
  originalText, 
  languageCode 
}: BilingualCommentProps) {
  // If no original text or language is English, just show the translated text
  if (!originalText || !languageCode || languageCode === 'en') {
    return (
      <div className="py-3">
        <p className="text-base font-bold text-[#344F1F] text-left">
          {title}
        </p>
        <p className="text-sm text-black/80 whitespace-pre-wrap break-words text-justify">
          {translatedText || <span className="text-black/60">No comment provided.</span>}
        </p>
      </div>
    );
  }

  // Find language name
  const language = languages.find(l => l.code === languageCode);
  const languageName = language?.name || languageCode;

  return (
    <div className="py-3 space-y-3">
      <p className="text-base font-bold text-[#344F1F] text-left">
        {title}
      </p>
      
      {/* Translated English Version */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            Translated to English
          </Badge>
        </div>
        <p className="text-sm text-black/80 whitespace-pre-wrap break-words text-justify bg-blue-50 p-3 rounded border border-blue-200">
          {translatedText}
        </p>
      </div>

      {/* Original Version */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Original ({languageName})
          </Badge>
        </div>
        <p className="text-sm text-black/60 whitespace-pre-wrap break-words text-justify bg-gray-50 p-3 rounded border border-gray-200">
          {originalText}
        </p>
      </div>
    </div>
  );
}
