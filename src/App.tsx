import {
  AppShell,
  Toolbar,
  Sidebar,
  Button,
  Popup,
  ThemeEditor,
  CommandPalette,
  Tooltip,
  UIGroup,
  aiBus,
} from '#toolcrib';
import useAppStore from './store/appStore';
import useNotebookStore from './store/notebookStore';
import OverviewPage from './components/Overview/OverviewPage';
import NotebookArea from './components/Notebook/NotebookArea';
import LedgerArea from './components/Ledger/LedgerArea';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: '🏢' },
  { id: 'notebook', label: 'Notebook', icon: '📓' },
  { id: 'ledger', label: 'Ledger', icon: '💳' },
];

export default function App() {
  const { activeArea, setActiveArea, navigateToNote } = useAppStore();
  const { notes } = useNotebookStore();

  const paletteItems = [
    ...NAV_ITEMS.map((item) => ({
      value: `nav-${item.id}`,
      label: `${item.icon} ${item.label}`,
      group: 'Navigate',
      onSelect: () => setActiveArea(item.id as typeof activeArea),
    })),
    ...notes.map((note) => ({
      value: `note-${note.id}`,
      label: `📝 ${note.title}`,
      group: 'Notes',
      onSelect: () => navigateToNote(note.id),
    })),
    {
      value: 'new-transaction',
      label: '＋ New Transaction',
      group: 'Actions',
      onSelect: () => {
        setActiveArea('ledger');
        aiBus.openModal('new-transaction-modal');
      },
    },
    {
      value: 'new-node',
      label: '＋ New Folder/Notebook',
      group: 'Actions',
      onSelect: () => {
        setActiveArea('notebook');
        aiBus.openModal('new-node-modal');
      },
    },
  ];

  return (
    <AppShell layout="sidebar-left">
      <AppShell.Header>
        <Toolbar>
          <Toolbar.Left>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '1rem' }}>
              🏢 Founder's Desk
            </span>
          </Toolbar.Left>
          <Toolbar.Right>
            <UIGroup>
              <Tooltip content="Command palette (⌘K)">
                <Button variant="outline" size="sm" icon="🔍" aria-label="Open command palette" onClick={() => aiBus.openCommandPalette()} />
              </Tooltip>
              <Popup
                id="theme-popup"
                trigger={
                  <Tooltip content="Theme settings">
                    <Button variant="outline" size="sm" icon="🎨" aria-label="Theme settings" />
                  </Tooltip>
                }
                placement="bottom-end"
              >
                <div style={{ width: '20rem', maxHeight: '32rem', overflowY: 'auto', padding: '0.75rem' }}>
                  <ThemeEditor />
                </div>
              </Popup>
            </UIGroup>
          </Toolbar.Right>
        </Toolbar>
      </AppShell.Header>

      <AppShell.Sidebar>
        <Sidebar items={NAV_ITEMS} activeId={activeArea} onItemClick={(id) => setActiveArea(id as typeof activeArea)} aria-label="Founder's Desk navigation" />
      </AppShell.Sidebar>

      <AppShell.Main>
        {activeArea === 'overview' && <OverviewPage />}
        {activeArea === 'notebook' && <NotebookArea />}
        {activeArea === 'ledger' && <LedgerArea />}
      </AppShell.Main>

      <CommandPalette items={paletteItems} placeholder="Jump to an area, a note, or run a command…" />
    </AppShell>
  );
}
