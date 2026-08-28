// `id` is required here, not optional -- EntityTable's own InsertType
// utility (used in db.ts) derives the *insert*-time shape (id optional,
// since it's Dexie-assigned on add()) from this base type automatically.
// Declaring it optional here instead would make every *read* path (get,
// toArray, ...) carry a spurious `number | undefined` for a field that's
// always genuinely present once loaded from the DB.

export type NotebookNodeType = 'folder' | 'notebook';

export interface NotebookNode {
  id: number;
  parentId: number | null;
  type: NotebookNodeType;
  name: string;
}

export interface NoteRecord {
  id: number;
  notebookId: number;
  title: string;
  /** Markdown source, entered by the user. */
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryRecord {
  id: number;
  name: string;
  /** Monthly discretionary budget for this category, in whole dollars. */
  monthlyBudget: number;
}

export type TransactionType = 'discretionary' | 'reimbursable';

export interface TransactionRecord {
  id: number;
  /** ISO date string (yyyy-MM-dd), not a full timestamp -- transactions are day-granular. */
  date: string;
  categoryId: number;
  type: TransactionType;
  amount: number;
  description: string;
  /** Only meaningful when `type === 'reimbursable'`. */
  reimbursed: boolean;
}

/** A `#action`-tagged line scanned out of a note's content, surfaced on the Overview. */
export interface ActionItem {
  noteId: number;
  noteTitle: string;
  notebookId: number;
  text: string;
}
