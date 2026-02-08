import React from 'react';

type Segment = {
  type: 'color' | 'bold' | 'link' | 'code' | 'text';
  content?: string;
  color?: string;
  url?: string;
  nested?: Segment[];
};

/**
 * Parse custom markdown-like syntax into React elements
 * Supports: {{color:text}}, **bold**, [text](url), `code`
 */
export function parseContent(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const result: React.ReactNode[] = [];

  lines.forEach((line, lineIndex) => {
    if (lineIndex > 0) {
      result.push(<br key={`br-${lineIndex}`} />);
    }

    const segments = parseLine(line);
    segments.forEach((segment, segIndex) => {
      const key = `l${lineIndex}-s${segIndex}`;
      result.push(segmentToReact(segment, key));
    });
  });

  return result;
}

function parseLine(line: string): Segment[] {
  const segments: Segment[] = [];
  let remaining = line;

  while (remaining.length > 0) {
    const colorMatch = remaining.match(/^\{\{(\w+):([^}]+)\}\}/);
    if (colorMatch) {
      const nestedSegments = parseLine(colorMatch[2]);
      segments.push({
        type: 'color',
        color: colorMatch[1],
        nested: nestedSegments,
      });
      remaining = remaining.slice(colorMatch[0].length);
      continue;
    }

    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
    if (boldMatch) {
      segments.push({
        type: 'bold',
        content: boldMatch[1],
      });
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      segments.push({
        type: 'link',
        content: linkMatch[1],
        url: linkMatch[2],
      });
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      segments.push({
        type: 'code',
        content: codeMatch[1],
      });
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    const plainMatch = remaining.match(/^([^{*[`]+)/);
    if (plainMatch) {
      segments.push({
        type: 'text',
        content: plainMatch[1],
      });
      remaining = remaining.slice(plainMatch[0].length);
      continue;
    }

    segments.push({
      type: 'text',
      content: remaining[0],
    });
    remaining = remaining.slice(1);
  }

  return segments;
}

function segmentToReact(segment: Segment, key: string): React.ReactNode {
  switch (segment.type) {
    case 'color':
      return (
        <span
          key={key}
          style={{ color: `var(--dracula-${segment.color})` }}
        >
          {segment.nested?.map((nested, i) => segmentToReact(nested, `${key}-${i}`))}
        </span>
      );

    case 'bold':
      return (
        <span key={key} style={{ fontWeight: 'bold' }}>
          {segment.content}
        </span>
      );

     case 'link':
       return (
         <a
           key={key}
           href={segment.url}
           target="_blank"
           rel="noopener noreferrer"
           style={{ color: 'inherit', textDecoration: 'underline' }}
         >
           {segment.content}
         </a>
       );

    case 'code':
      return (
        <span
          key={key}
          style={{
            fontFamily: 'monospace',
            background: 'var(--dracula-current-line)',
            padding: '2px 4px',
          }}
        >
          {segment.content}
        </span>
      );

    case 'text':
    default:
      return <span key={key}>{segment.content}</span>;
  }
}
