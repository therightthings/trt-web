export function minifyHtml(html: string): string {
  const preservedBlocks: string[] = [];
  const protectedHtml = html.replace(/<pre\b[\s\S]*?<\/pre>/gi, (block) => {
    const index = preservedBlocks.push(block) - 1;
    return `___HTML_BLOCK_${index}___`;
  });
  const minifiedHtml = protectedHtml.replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();

  return minifiedHtml.replace(/___HTML_BLOCK_(\d+)___/g, (_match, index: string) => {
    return preservedBlocks[Number(index)];
  });
}
