export function formatError(error: any): string {
  if (!error) {
    return 'An unknown error occurred.';
  }

  const message = error.message || 'An unknown error occurred.';
  let result = message;

  if (error.stack) {
    // V8 (Chrome, Node) stack traces look like:
    // Error: message
    //     at functionName (fileName:line:col)
    // or sometimes just
    //     at fileName:line:col
    // Firefox stack traces look like:
    // functionName@fileName:line:col
    const stackLines = error.stack.split('\n');
    
    // Find the first line in the stack that contains file info
    const locationLine = stackLines.find((line: string) => line.includes(':') && (line.includes('/') || line.includes('@')));

    if (locationLine) {
      // Regex to capture file path, line, and column.
      // It handles optional parentheses around the location and both "at " and "@" formats.
      const match = locationLine.match(/(?:\(?|@)([^(\n@]+?):(\d+):(\d+)\)?$/);
      
      if (match) {
        const filePath = match[1];
        const lineNumber = match[2];
        const columnNumber = match[3];
        let fileName = filePath.split('/').pop() || filePath;
        
        let decodedFileName = fileName;
        try {
          if (typeof window !== 'undefined' && fileName.length > 20 && !fileName.includes('.')) {
            const decoded = atob(fileName);
            // Check if the decoded content looks like code by checking for common patterns
            if (decoded.includes('=') || decoded.includes('{') || decoded.includes('function') || decoded.includes('const') || decoded.includes('let')) {
              decodedFileName = `[ENCODED] First few lines:\n${decoded.split('\n').slice(0, 5).join('\n')}...`;
            }
          }
        } catch (decodeError) {
          // If decoding fails, keep the original filename
        }
        
        result += `\n\n**Location:** \`${fileName}\` (Line: ${lineNumber}, Column: ${columnNumber})`;
        
        if (decodedFileName !== fileName) {
          result += `\n\n**Decoded Content Preview:**\n\`\`\`\n${decodedFileName}\n\`\`\``;
        }
      }
    }

    // Add a condensed call stack for better debugging
    const relevantStackLines = stackLines
      .slice(1, 6) // Skip the error message line and take next 5 lines
      .filter(line => line.trim() && !line.includes('node_modules'))
      .map(line => line.trim());

    if (relevantStackLines.length > 0) {
      result += `\n\n**Call Stack:**\n`;
      relevantStackLines.forEach((line, index) => {
        result += `${index + 1}. ${line}\n`;
      });
    }

    // For server environments, also include the full stack trace
    if (typeof window === 'undefined') { // Server-side
      result += `\n\n**Full Stack Trace:**\n\`\`\`\n${error.stack}\n\`\`\``;
    }
  }

  // Add error type information
  if (error.name && error.name !== 'Error') {
    result += `\n\n**Error Type:** ${error.name}`;
  }

  return result;
}

// Additional helper function for extracting code context from encoded stack traces
export function extractCodeContextFromStack(error: any): string | null {
  if (!error?.stack) return null;

  try {
    const stackLines = error.stack.split('\n');
    
    for (const line of stackLines) {
      const match = line.match(/(?:\(?|@)([^(\n@]+?):(\d+):(\d+)\)?$/);
      if (match) {
        const filePath = match[1];
        const lineNumber = parseInt(match[2]);
        
        // Try to decode if it looks like base64
        if (typeof window !== 'undefined' && filePath.length > 20 && !filePath.includes('.')) {
          try {
            const decoded = atob(filePath);
            const lines = decoded.split('\n');
            
            // Extract context around the error line
            const start = Math.max(0, lineNumber - 3);
            const end = Math.min(lines.length, lineNumber + 2);
            const context = lines.slice(start, end);
            
            let result = `**Code context around line ${lineNumber}:**\n\`\`\`javascript\n`;
            context.forEach((codeLine, index) => {
              const actualLineNum = start + index + 1;
              const marker = actualLineNum === lineNumber ? ' >>> ' : '     ';
              result += `${actualLineNum}${marker}${codeLine}\n`;
            });
            result += '\`\`\`';
            
            return result;
          } catch (decodeError) {
            // Decoding failed, continue to next line
          }
        }
      }
    }
  } catch (e) {
    // If anything fails, return null
  }
  
  return null;
}

// Enhanced version that includes code context
export function formatErrorWithContext(error: any): string {
  const basicFormat = formatError(error);
  const codeContext = extractCodeContextFromStack(error);
  
  if (codeContext) {
    return `${basicFormat}\n\n${codeContext}`;
  }
  
  return basicFormat;
}