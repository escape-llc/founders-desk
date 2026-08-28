import { create } from 'zustand';
import useNotebookStore from './notebookStore';

export type AppArea = 'overview' | 'notebook' | 'ledger';

interface AppStore {
  activeArea: AppArea;
  setActiveArea: (area: AppArea) => void;
  /** Switches to the Notebook area and opens the given note — how Overview's action items jump back into their source note. */
  navigateToNote: (noteId: number) => void;
}

const useAppStore = create<AppStore>((set) => ({
  activeArea: 'overview',
  setActiveArea: (area) => set({ activeArea: area }),
  navigateToNote: (noteId) => {
    useNotebookStore.getState().openNote(noteId);
    set({ activeArea: 'notebook' });
  },
}));

export default useAppStore;
