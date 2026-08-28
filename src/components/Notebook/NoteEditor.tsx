import { useEffect, useRef, useState } from 'react';
import { Splitter, Input, Button, Tooltip } from '#toolcrib';
import useNotebookStore from '../../store/notebookStore';
import { renderMarkdownLite } from '../../lib/markdown';
import type { NoteRecord } from '../../types';

const SAVE_DEBOUNCE_MS = 400;

export default function NoteEditor({ note }: { note: NoteRecord }) {
  const { updateNoteContent, updateNoteTitle, deleteNote } = useNotebookStore();
  // Plain initializers, not synced via effect: this component is mounted
  // one-to-one with a single note (NotebookArea keys each TabStrip.Panel
  // by note.id, and panels are never reused across different notes), so
  // `note` never actually changes identity under an already-mounted
  // instance -- there's nothing external to resync from.
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleContentChange = (value: string) => {
    setContent(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateNoteContent(note.id, value), SAVE_DEBOUNCE_MS);
  };

  const commitTitle = () => {
    const trimmed = title.trim();
    if (trimmed && trimmed !== note.title) updateNoteTitle(note.id, trimmed);
    else setTitle(note.title);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 0.875rem', borderBottom: '0.0625rem solid var(--ai-border)' }}>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={commitTitle}
          aria-label="Note title"
          size="sm"
        />
        <Tooltip content="Delete note">
          <Button variant="ghost" size="sm" icon="🗑️" aria-label="Delete note" onClick={() => deleteNote(note.id)} />
        </Tooltip>
      </div>
      <div style={{ flex: '1 1 0px', minHeight: 0 }}>
        <Splitter orientation="horizontal" initialSplit={50}>
          <Splitter.Panel>
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              aria-label="Note content (Markdown)"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                outline: 'none',
                resize: 'none',
                padding: '1rem',
                fontFamily: 'inherit',
                fontSize: '0.875rem',
                lineHeight: 1.6,
                background: 'var(--ai-bg-surface)',
                color: 'var(--ai-text-primary)',
                boxSizing: 'border-box',
              }}
            />
          </Splitter.Panel>
          <Splitter.Panel>
            <div
              className="note-preview"
              style={{ height: '100%', overflowY: 'auto', padding: '1rem 1.25rem' }}
              // Safe: renderMarkdownLite escapes to plain text first and
              // only ever introduces markup it controls itself -- see its
              // own doc comment.
              dangerouslySetInnerHTML={{ __html: renderMarkdownLite(content) }}
            />
          </Splitter.Panel>
        </Splitter>
      </div>
    </div>
  );
}
