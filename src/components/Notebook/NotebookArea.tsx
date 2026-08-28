import { useEffect, useState } from 'react';
import { Splitter, TabStrip, Button, Tooltip, EmptyState, AlertDialog } from '#toolcrib';
import useNotebookStore from '../../store/notebookStore';
import NotebookTree from './NotebookTree';
import NoteEditor from './NoteEditor';
import NewNodeModal from './NewNodeModal';

const TAB_GROUP = 'notebook-tabs';

export default function NotebookArea() {
  const { nodes, notes, openNoteIds, activeNoteId, openNote, closeNote, setActiveNote, createNote, deleteNode, loadFromDB } =
    useNotebookStore();
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);

  useEffect(() => {
    loadFromDB();
  }, [loadFromDB]);

  const openNotes = openNoteIds
    .map((id) => notes.find((n) => n.id === id))
    .filter((n): n is NonNullable<typeof n> => !!n);

  const activeNote = activeNoteId !== null ? notes.find((n) => n.id === activeNoteId) ?? null : null;
  const selectedNode = selectedNodeId !== null ? nodes.find((n) => n.id === selectedNodeId) : undefined;

  // "+ Note" targets the selected notebook if one is selected in the tree,
  // otherwise falls back to whichever notebook the currently active note
  // lives in -- so it stays usable right after opening a note via
  // quick-open/CommandPalette, not just via a fresh tree click.
  const targetNotebookId = selectedNode?.type === 'notebook' ? selectedNode.id : activeNote?.notebookId ?? null;
  const newNodeParentId = selectedNode?.type === 'folder' ? selectedNode.id : selectedNode?.parentId ?? null;

  const tabItems = openNotes.map((note) => ({
    id: String(note.id),
    label: (
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '9rem' }}>{note.title}</span>
        <span
          role="button"
          tabIndex={-1}
          aria-label={`Close ${note.title}`}
          onClick={(e) => {
            e.stopPropagation();
            closeNote(note.id);
          }}
          style={{ fontSize: '0.75rem', opacity: 0.7, cursor: 'pointer' }}
        >
          ✕
        </span>
      </span>
    ),
  }));

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 0.875rem', borderBottom: '0.0625rem solid var(--ai-border)' }}>
        <span style={{ fontWeight: 600, fontSize: '0.9375rem', flex: 1 }}>📓 Notebook</span>
        <NewNodeModal parentId={newNodeParentId} />
        <Tooltip content={targetNotebookId ? 'New note' : 'Select a notebook first'}>
          <Button
            variant="outline"
            size="sm"
            icon="📝"
            aria-label="New note"
            disabled={!targetNotebookId}
            onClick={() => targetNotebookId && createNote(targetNotebookId, 'Untitled Note')}
          />
        </Tooltip>
        <AlertDialog
          id="delete-node-confirm"
          trigger={
            <Tooltip content={selectedNode ? 'Delete selected item' : 'Select an item first'}>
              <Button variant="outline" size="sm" icon="🗑️" aria-label="Delete selected item" disabled={!selectedNode} />
            </Tooltip>
          }
          ariaLabel="Confirm delete"
        >
          <AlertDialog.Header>Delete {selectedNode?.type === 'folder' ? 'Folder' : 'Notebook'}?</AlertDialog.Header>
          <AlertDialog.Body>
            This deletes “{selectedNode?.name}” and everything inside it, including its notes.
          </AlertDialog.Body>
          <AlertDialog.Actions>
            <AlertDialog.Cancel />
            <AlertDialog.Action
              onClick={() => {
                if (selectedNode) {
                  deleteNode(selectedNode.id);
                  setSelectedNodeId(null);
                }
              }}
            >
              Delete
            </AlertDialog.Action>
          </AlertDialog.Actions>
        </AlertDialog>
      </div>

      <div style={{ flex: '1 1 0px', minHeight: 0 }}>
        <Splitter orientation="horizontal" initialSplit={24} minSize={16}>
          <Splitter.Panel>
            <div style={{ height: '100%', overflowY: 'auto', padding: '0.75rem' }}>
              <NotebookTree
                activeNoteId={activeNoteId}
                onOpenNote={openNote}
                selectedNodeId={selectedNodeId}
                onSelectNode={setSelectedNodeId}
              />
            </div>
          </Splitter.Panel>
          <Splitter.Panel>
            {openNotes.length === 0 ? (
              <EmptyState>
                <EmptyState.Title>No notes open</EmptyState.Title>
                <EmptyState.Description>Pick a note from the tree, or create a new one.</EmptyState.Description>
              </EmptyState>
            ) : (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '0.5rem 0.75rem 0', flexShrink: 0 }}>
                  <TabStrip
                    id={TAB_GROUP}
                    items={tabItems}
                    activeId={activeNoteId !== null ? String(activeNoteId) : undefined}
                    onChange={(id) => setActiveNote(Number(id))}
                  />
                </div>
                {openNotes.map((note) => (
                  <TabStrip.Panel key={note.id} groupId={TAB_GROUP} value={String(note.id)}>
                    <NoteEditor note={note} />
                  </TabStrip.Panel>
                ))}
              </div>
            )}
          </Splitter.Panel>
        </Splitter>
      </div>
    </div>
  );
}
