export type ParsedReadmeCodeBlock = {
  language?: string;
  code: string;
};

export type ParsedReadmeNode = {
  level: number;
  title: string;
  content: string;
  codeBlocks: ParsedReadmeCodeBlock[];
  children: ParsedReadmeNode[];
};

export function parseReadme(readme: string): ParsedReadmeNode[] {
  const roots: ParsedReadmeNode[] = [];
  const stack: ParsedReadmeNode[] = [];
  let contentLines: string[] = [];
  let inCodeBlock = false;
  let codeLanguage: string | undefined;
  let codeLines: string[] = [];
  let activeNode: ParsedReadmeNode | undefined;

  const flushContent = (): void => {
    if (!activeNode) {
      contentLines = [];
      return;
    }

    const content = contentLines.join('\n').trim();
    if (content) {
      activeNode.content = activeNode.content ? `${activeNode.content}\n${content}` : content;
    }
    contentLines = [];
  };

  const flushCode = (): void => {
    if (!activeNode) {
      codeLines = [];
      codeLanguage = undefined;
      return;
    }

    activeNode.codeBlocks.push({
      language: codeLanguage,
      code: codeLines.join('\n'),
    });
    codeLines = [];
    codeLanguage = undefined;
  };

  for (const line of readme.split(/\r?\n/)) {
    const codeStart = line.match(/^\s*```(.*)$/);
    if (codeStart) {
      if (inCodeBlock) {
        flushCode();
        inCodeBlock = false;
      } else {
        flushContent();
        inCodeBlock = true;
        codeLanguage = codeStart[1].trim() || undefined;
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+?)\s*#*$/);
    if (!heading) {
      contentLines.push(line);
      continue;
    }

    flushContent();
    const node: ParsedReadmeNode = {
      level: heading[1].length,
      title: heading[2].trim(),
      content: '',
      codeBlocks: [],
      children: [],
    };

    while (stack.length > 0 && stack[stack.length - 1].level >= node.level) {
      stack.pop();
    }

    const parent = stack[stack.length - 1];
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }

    stack.push(node);
    activeNode = node;
  }

  if (inCodeBlock || codeLines.length > 0) {
    flushCode();
  }
  flushContent();

  return roots;
}
