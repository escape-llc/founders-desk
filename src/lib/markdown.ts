/**
 * Minimal, dependency-free markdown-to-HTML for the note preview pane.
 * Escapes to plain text FIRST, then only ever introduces markup this
 * function itself controls (headings, bold/italic, list items, an
 * `#action` tag highlight) -- safe against arbitrary HTML/script content
 * even though nothing here fetches over the network (unlike Feed Farmer's
 * dompurify usage, which sanitizes real third-party HTML).
 */

function escapeHtml(source: string): string {
  return source.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function inline(text: string): string {
  let result = text;
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>');
  result = result.replace(/#action\b/gi, '<span class="action-tag">#action</span>');
  return result;
}

export function renderMarkdownLite(source: string): string {
  const lines = escapeHtml(source).split('\n');
  const html: string[] = [];
  let inList = false;

  const closeList = () => {
    if (inList) {
      html.push('</ul>');
      inList = false;
    }
  };

  for (const line of lines) {
    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    const listItem = /^[-*]\s+(.*)$/.exec(line);

    if (heading) {
      closeList();
      const level = heading[1].length;
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
    } else if (listItem) {
      if (!inList) {
        html.push('<ul>');
        inList = true;
      }
      html.push(`<li>${inline(listItem[1])}</li>`);
    } else if (line.trim() === '') {
      closeList();
    } else {
      closeList();
      html.push(`<p>${inline(line)}</p>`);
    }
  }
  closeList();
  return html.join('\n');
}
