import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  inline?: boolean;
}

// Configure marked to handle newlines as <br> tags and enable GitHub Flavored Markdown
marked.setOptions({
  breaks: true,
  gfm: true,
});

export default function MarkdownRenderer({ content, className = '', inline = false }: MarkdownRendererProps): React.ReactNode {
  const [sanitizedHtml, setSanitizedHtml] = useState('');

  useEffect(() => {
    const processContent = async () => {
      if (typeof content !== 'string') {
        setSanitizedHtml('');
        return;
      }
      try {
        const rawHtml = await (inline
          ? marked.parseInline(content)
          : marked.parse(content));
        setSanitizedHtml(DOMPurify.sanitize(rawHtml));
      } catch (error) {
        console.error("Error processing content:", error);
        // Fallback to sanitizing the original content as plain text
        setSanitizedHtml(DOMPurify.sanitize(content));
      }
    };

    processContent();
  }, [content, inline]);

  const WrapperComponent = inline ? 'span' : 'div';
  const wrapperClassName = inline
    ? className
    : `prose prose-invert max-w-none prose-p:my-2 prose-headings:my-3 ${className}`;

  return (
    <WrapperComponent
      className={wrapperClassName}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
