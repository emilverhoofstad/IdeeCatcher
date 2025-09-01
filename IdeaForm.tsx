import React, { useState, useRef, useEffect, useCallback } from 'react';
import { sendEmail } from '../services/emailService.ts';
import { PRIVATE_EMAIL, BUSINESS_EMAIL, EMAIL_SUBJECT } from '../constants.ts';
import { SendButton } from './SendButton.tsx';

export const IdeaForm: React.FC = () => {
  const [idea, setIdea] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const showFeedback = (message: string, isError = false) => {
    setFeedback({ message, isError });
    setTimeout(() => {
      setFeedback(null);
    }, 2000);
  };

  const handleSend = useCallback(async (recipient: string) => {
    if (!idea.trim() || isSending) return;

    setIsSending(true);
    
    const timestamp = new Date().toLocaleString('nl-NL', {
      dateStyle: 'full',
      timeStyle: 'medium',
    });
    const emailBody = `${idea.trim()}\n\nVerzonden op: ${timestamp}`;

    try {
      await sendEmail(recipient, EMAIL_SUBJECT, emailBody);
      showFeedback('Verzonden ✓');
      setIdea('');
      textareaRef.current?.focus();
    } catch (error) {
      console.error('Failed to send email:', error);
      showFeedback('Fout bij verzenden', true);
    } finally {
      setIsSending(false);
    }
  }, [idea, isSending]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        handleSend(PRIVATE_EMAIL);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSend]);
  
  const showButtons = idea.trim().length > 0;

  return (
    <div className="relative bg-white shadow-lg rounded-2xl p-6 transition-all duration-300">
      <textarea
        ref={textareaRef}
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        placeholder="Typ hier je idee..."
        className="w-full h-48 md:h-64 p-4 text-lg text-gray-900 placeholder-gray-500 bg-gray-50 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none transition-colors duration-200"
        disabled={isSending}
      />
      <div className={`
        mt-4 flex flex-col sm:flex-row justify-end items-center gap-4 
        overflow-hidden transition-all duration-500 ease-in-out
        ${showButtons ? 'opacity-100 max-h-40' : 'opacity-0 max-h-0'}`
      }>
          <SendButton
            onClick={() => handleSend(PRIVATE_EMAIL)}
            disabled={isSending}
            variant="private"
          >
            {isSending ? 'Bezig...' : 'Privé'}
          </SendButton>
          <SendButton
            onClick={() => handleSend(BUSINESS_EMAIL)}
            disabled={isSending}
            variant="business"
          >
            {isSending ? 'Bezig...' : 'Zakelijk'}
          </SendButton>
      </div>

      {feedback && (
        <div className={`absolute bottom-5 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-white font-semibold text-sm shadow-md ${feedback.isError ? 'bg-red-500' : 'bg-green-500'}`}>
          {feedback.message}
        </div>
      )}
    </div>
  );
};