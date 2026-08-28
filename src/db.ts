import Dexie, { type EntityTable } from 'dexie';
import type { NotebookNode, NoteRecord, CategoryRecord, TransactionRecord } from './types';

const db = new Dexie('FoundersDeskDB') as Dexie & {
  notebookNodes: EntityTable<NotebookNode, 'id'>;
  notes: EntityTable<NoteRecord, 'id'>;
  categories: EntityTable<CategoryRecord, 'id'>;
  transactions: EntityTable<TransactionRecord, 'id'>;
};

db.version(1).stores({
  notebookNodes: '++id, parentId, type',
  notes: '++id, notebookId, updatedAt',
  categories: '++id, name',
  transactions: '++id, date, categoryId, type',
});

export default db;
