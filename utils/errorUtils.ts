export function formatError(error: any): string {
  if (!error) {
    return 'An unknown error occurred.';
  }

  const message = error.message || 'An unknown error occurred.';
  
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
        const fileName = filePath.split('/').pop(); // Get just the filename
        
        return `${message}\n\n**Location:** \`${fileName}\` (Line: ${lineNumber})`;
      }
    }
  }

  return message;
}
