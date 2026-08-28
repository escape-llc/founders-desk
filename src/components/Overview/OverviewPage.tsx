import { useEffect, useMemo } from 'react';
import { Card, CardSimple, Grid, Progress, Badge, EmptyState, Separator } from '#toolcrib';
import useNotebookStore from '../../store/notebookStore';
import useLedgerStore from '../../store/ledgerStore';
import useAppStore from '../../store/appStore';
import { scanActionItems } from '../../lib/actionItems';
import { monthKeyFromIsoDate, currentCalendarDate, monthKeyFromCalendarDate, formatMonthLabel } from '../../lib/dateRange';

export default function OverviewPage() {
  const { notes, loadFromDB: loadNotebook } = useNotebookStore();
  const { categories, transactions, loadFromDB: loadLedger } = useLedgerStore();
  const navigateToNote = useAppStore((s) => s.navigateToNote);

  useEffect(() => {
    loadNotebook();
    loadLedger();
  }, [loadNotebook, loadLedger]);

  const currentMonth = currentCalendarDate();
  const currentMonthKey = monthKeyFromCalendarDate(currentMonth);
  const monthLabel = formatMonthLabel(currentMonth);

  const monthTransactions = useMemo(
    () => transactions.filter((t) => monthKeyFromIsoDate(t.date) === currentMonthKey),
    [transactions, currentMonthKey]
  );

  const totalSpend = useMemo(() => monthTransactions.reduce((sum, t) => sum + t.amount, 0), [monthTransactions]);
  const totalBudget = useMemo(() => categories.reduce((sum, c) => sum + c.monthlyBudget, 0), [categories]);
  const budgetRemaining = totalBudget - totalSpend;

  const pendingReimbursements = useMemo(
    () => monthTransactions.filter((t) => t.type === 'reimbursable' && !t.reimbursed),
    [monthTransactions]
  );
  const pendingReimbursementTotal = pendingReimbursements.reduce((sum, t) => sum + t.amount, 0);

  const actionItems = useMemo(() => scanActionItems(notes), [notes]);

  const categorySpend = useMemo(() => {
    return categories.map((category) => {
      const spend = monthTransactions.filter((t) => t.categoryId === category.id).reduce((sum, t) => sum + t.amount, 0);
      return { category, spend };
    });
  }, [categories, monthTransactions]);

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🏢 Overview
        </h1>
        <p style={{ color: 'var(--ai-text-secondary)', marginTop: '0.25rem', fontSize: '0.875rem' }}>
          Acme Analytics — {monthLabel} at a glance
        </p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <Grid columns="auto-fit" minColWidth="12rem">
          <CardSimple title="This Month's Spend">
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>${totalSpend.toFixed(2)}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--ai-text-secondary)' }}>across {monthTransactions.length} transactions</div>
          </CardSimple>
          <CardSimple title="Budget Remaining">
            <div style={{ fontSize: '2rem', fontWeight: 700, color: budgetRemaining < 0 ? 'var(--ai-subtheme-error)' : undefined }}>
              ${budgetRemaining.toFixed(2)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--ai-text-secondary)' }}>of ${totalBudget.toFixed(2)} monthly</div>
          </CardSimple>
          <CardSimple title="Open Action Items">
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{actionItems.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--ai-text-secondary)' }}>tagged across your notebooks</div>
          </CardSimple>
          <CardSimple title="Pending Reimbursement">
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>${pendingReimbursementTotal.toFixed(2)}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--ai-text-secondary)' }}>{pendingReimbursements.length} awaiting reimbursement</div>
          </CardSimple>
        </Grid>
      </div>

      <Grid columns={2} gap="lg">
        <Card>
          <Card.Header>Budget by Category</Card.Header>
          <Card.Content>
            {categorySpend.length === 0 ? (
              <EmptyState>
                <EmptyState.Title>No categories yet</EmptyState.Title>
              </EmptyState>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {categorySpend.map(({ category, spend }) => {
                  const overBudget = spend > category.monthlyBudget;
                  return (
                    <div key={category.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                        <span>{category.name}</span>
                        <span style={{ color: overBudget ? 'var(--ai-subtheme-error)' : 'var(--ai-text-secondary)' }}>
                          ${spend.toFixed(2)} / ${category.monthlyBudget.toFixed(2)}
                        </span>
                      </div>
                      <Progress
                        aria-label={`${category.name} budget usage`}
                        value={spend}
                        max={category.monthlyBudget}
                        subtheme={overBudget ? 'error' : undefined}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Action Items
              {actionItems.length > 0 && (
                <Badge size="sm" appearance="soft">
                  {actionItems.length}
                </Badge>
              )}
            </span>
          </Card.Header>
          <Card.Content>
            {actionItems.length === 0 ? (
              <EmptyState>
                <EmptyState.Title>Nothing tagged #action right now.</EmptyState.Title>
              </EmptyState>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {actionItems.map((item, index) => (
                  <div key={`${item.noteId}-${index}`}>
                    {index > 0 && <Separator />}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => navigateToNote(item.noteId)}
                      onKeyDown={(e) => e.key === 'Enter' && navigateToNote(item.noteId)}
                      style={{ padding: '0.625rem 0', cursor: 'pointer' }}
                    >
                      <div style={{ fontSize: '0.875rem' }}>{item.text}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--ai-text-secondary)', marginTop: '0.125rem' }}>
                        from “{item.noteTitle}”
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card.Content>
        </Card>
      </Grid>
    </div>
  );
}
