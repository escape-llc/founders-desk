import { useMemo, useState } from 'react';
import { Tree, type TreeItemData } from '#toolcrib';
import useNotebookStore from '../../store/notebookStore';
import type { NotebookNode } from '../../types';

interface NotebookTreeProps {
  activeNoteId: number | null;
  onOpenNote: (noteId: number) => void;
  selectedNodeId: number | null;
  onSelectNode: (nodeId: number | null) => void;
}

const FOLDER_ICON = '📁';
const NOTEBOOK_ICON = '📓';
const NOTE_ICON = '📝';

export default function NotebookTree({ activeNoteId, onOpenNote, selectedNodeId, onSelectNode }: NotebookTreeProps) {
  const { nodes, notes } = useNotebookStore();
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const treeItems = useMemo<TreeItemData[]>(() => {
    const childrenOf = (parentId: number | null): NotebookNode[] => nodes.filter((n) => n.parentId === parentId);
    const notesOf = (notebookId: number) => notes.filter((n) => n.notebookId === notebookId);

    const buildNode = (node: NotebookNode): TreeItemData => {
      const childNodes = childrenOf(node.id).map(buildNode);
      const noteLeaves =
        node.type === 'notebook'
          ? notesOf(node.id).map((note) => ({
              id: `note-${note.id}`,
              label: (
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {NOTE_ICON} {note.title}
                </span>
              ),
            }))
          : [];
      return {
        id: `node-${node.id}`,
        label: `${node.type === 'folder' ? FOLDER_ICON : NOTEBOOK_ICON} ${node.name}`,
        children: [...childNodes, ...noteLeaves],
      };
    };

    return childrenOf(null).map(buildNode);
  }, [nodes, notes]);

  const selectedTreeId =
    activeNoteId !== null ? `note-${activeNoteId}` : selectedNodeId !== null ? `node-${selectedNodeId}` : undefined;

  return (
    <Tree
      items={treeItems}
      expandedIds={expandedIds}
      onExpandedChange={setExpandedIds}
      selectedId={selectedTreeId}
      onSelectChange={(id) => {
        if (!id) return;
        if (id.startsWith('note-')) {
          onOpenNote(Number(id.slice(5)));
        } else if (id.startsWith('node-')) {
          onSelectNode(Number(id.slice(5)));
        }
      }}
    />
  );
}
