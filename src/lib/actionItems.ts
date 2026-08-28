import type { NoteRecord, ActionItem } from '../types';

const ACTION_TAG = /#action\b/i;

/**
 * Scans every note's markdown content for lines tagged `#action` and
 * returns one `ActionItem` per matching line — this is what ties the
 * Overview to the Notebook's real content, per ORIGIN.md's concept.
 */
export function scanActionItems(notes: NoteRecord[]): ActionItem[] {
  const items: ActionItem[] = [];
  for (const note of notes) {
    const lines = note.content.split('\n');
    for (const line of lines) {
      if (!ACTION_TAG.test(line)) continue;
      const text = line.replace(ACTION_TAG, '').trim();
      if (!text) continue;
      items.push({ noteId: note.id, noteTitle: note.title, notebookId: note.notebookId, text });
    }
  }
  return items;
}
