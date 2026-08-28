import { create } from 'zustand';
import type { InsertType } from 'dexie';
import db from '../db';
import type { NotebookNode, NoteRecord } from '../types';
import { SEED_NOTEBOOK_NODES, SEED_NOTES, seedIsoTimestamp } from '../defaultData';

/** Guard against React StrictMode double-mounting seeding default data twice. */
let _seeding = false;

interface NotebookStore {
  nodes: NotebookNode[];
  notes: NoteRecord[];
  /** Ids of notes currently open in the TabStrip, in tab order. */
  openNoteIds: number[];
  activeNoteId: number | null;

  loadFromDB: () => Promise<void>;
  createNode: (name: string, type: NotebookNode['type'], parentId: number | null) => Promise<number>;
  renameNode: (id: number, name: string) => Promise<void>;
  deleteNode: (id: number) => Promise<void>;
  createNote: (notebookId: number, title: string) => Promise<number>;
  updateNoteContent: (id: number, content: string) => Promise<void>;
  updateNoteTitle: (id: number, title: string) => Promise<void>;
  deleteNote: (id: number) => Promise<void>;
  openNote: (id: number) => void;
  closeNote: (id: number) => void;
  setActiveNote: (id: number | null) => void;
}

async function reloadAll(set: (partial: Partial<NotebookStore>) => void) {
  const nodes = await db.notebookNodes.toArray();
  const notes = await db.notes.orderBy('updatedAt').reverse().toArray();
  set({ nodes, notes });
}

const useNotebookStore = create<NotebookStore>((set, get) => ({
  nodes: [],
  notes: [],
  openNoteIds: [],
  activeNoteId: null,

  loadFromDB: async () => {
    await reloadAll(set);

    if (get().nodes.length === 0 && !_seeding) {
      _seeding = true;
      const tempIdToRealId = new Map<string, number>();

      for (const seedNode of SEED_NOTEBOOK_NODES) {
        const parentId = seedNode.parentTempId ? tempIdToRealId.get(seedNode.parentTempId) ?? null : null;
        const record: InsertType<NotebookNode, 'id'> = {
          parentId,
          type: seedNode.type,
          name: seedNode.name,
        };
        const id = await db.notebookNodes.add(record);
        tempIdToRealId.set(seedNode.tempId, id);
      }

      for (const seedNote of SEED_NOTES) {
        const notebookId = tempIdToRealId.get(seedNote.notebookTempId);
        if (notebookId === undefined) continue;
        const timestamp = seedIsoTimestamp(seedNote.daysAgo);
        const record: InsertType<NoteRecord, 'id'> = {
          notebookId,
          title: seedNote.title,
          content: seedNote.content,
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        await db.notes.add(record);
      }

      await reloadAll(set);
      _seeding = false;
    }
  },

  createNode: async (name, type, parentId) => {
    const id = await db.notebookNodes.add({ name, type, parentId });
    await reloadAll(set);
    return id;
  },

  renameNode: async (id, name) => {
    await db.notebookNodes.update(id, { name });
    await reloadAll(set);
  },

  deleteNode: async (id) => {
    // Collect this node and every descendant (folders can nest notebooks
    // and other folders), then remove their notes before the nodes
    // themselves so nothing is orphaned.
    const allNodes = get().nodes;
    const toDelete = new Set<number>([id]);
    let grew = true;
    while (grew) {
      grew = false;
      for (const node of allNodes) {
        if (node.parentId !== null && toDelete.has(node.parentId) && !toDelete.has(node.id)) {
          toDelete.add(node.id);
          grew = true;
        }
      }
    }

    for (const nodeId of toDelete) {
      await db.notes.where('notebookId').equals(nodeId).delete();
    }
    await db.notebookNodes.bulkDelete(Array.from(toDelete));

    const closedIds = get().openNoteIds.filter((noteId) => !get().notes.some((n) => n.id === noteId && toDelete.has(n.notebookId)));
    set({ openNoteIds: closedIds });
    await reloadAll(set);
  },

  createNote: async (notebookId, title) => {
    const now = new Date().toISOString();
    const id = await db.notes.add({ notebookId, title, content: `# ${title}\n\n`, createdAt: now, updatedAt: now });
    await reloadAll(set);
    get().openNote(id);
    return id;
  },

  updateNoteContent: async (id, content) => {
    await db.notes.update(id, { content, updatedAt: new Date().toISOString() });
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, content, updatedAt: new Date().toISOString() } : n)),
    }));
  },

  updateNoteTitle: async (id, title) => {
    await db.notes.update(id, { title, updatedAt: new Date().toISOString() });
    set((state) => ({ notes: state.notes.map((n) => (n.id === id ? { ...n, title } : n)) }));
  },

  deleteNote: async (id) => {
    await db.notes.delete(id);
    set((state) => ({
      openNoteIds: state.openNoteIds.filter((n) => n !== id),
      activeNoteId: state.activeNoteId === id ? null : state.activeNoteId,
    }));
    await reloadAll(set);
  },

  openNote: (id) => {
    set((state) => ({
      openNoteIds: state.openNoteIds.includes(id) ? state.openNoteIds : [...state.openNoteIds, id],
      activeNoteId: id,
    }));
  },

  closeNote: (id) => {
    set((state) => {
      const openNoteIds = state.openNoteIds.filter((n) => n !== id);
      const activeNoteId = state.activeNoteId === id ? openNoteIds[openNoteIds.length - 1] ?? null : state.activeNoteId;
      return { openNoteIds, activeNoteId };
    });
  },

  setActiveNote: (id) => set({ activeNoteId: id }),
}));

export default useNotebookStore;
