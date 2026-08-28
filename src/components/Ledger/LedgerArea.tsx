import { useEffect, useMemo, useState } from 'react';
import { Splitter, DataTable, type Column, Button, Badge, Tooltip, DatePicker, Card, EmptyState } from '#toolcrib';
import useLedgerStore from '../../store/ledgerStore';
import TransactionForm from './TransactionForm';
import CategoryBreakdownChart from './CategoryBreakdownChart';
import { currentCalendarDate, monthKeyFromCalendarDate, monthKeyFromIsoDate, formatMonthLabel } from '../../lib/dateRange';
import type { TransactionRecord } from '../../types';
import type { CalendarDate } from '@internationalized/date';

export default function LedgerArea() {
  const { categories, transactions, deleteTransaction, updateTransaction, loadFromDB } = useLedgerStore();
  const [monthDate, setMonthDate] = useState<CalendarDate>(currentCalendarDate());

  useEffect(() => {
    loadFromDB();
  }, [loadFromDB]);

  const monthKey = monthKeyFromCalendarDate(monthDate);
  const monthTransactions = useMemo(
    () => transactions.filter((t) => monthKeyFromIsoDate(t.date) === monthKey),
    [transactions, monthKey]
  );

  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const shiftMonth = (delta: number) => {
    setMonthDate((prev) => (delta > 0 ? prev.add({ months: 1 }) : prev.subtract({ months: 1 })));
  };

  const columns: Column<TransactionRecord>[] = [
    { key: 'date', title: 'Date', sortable: true, width: '7rem' },
    {
      key: 'categoryId',
      title: 'Category',
      sortable: true,
      accessorFn: (t) => categoryById.get(t.categoryId)?.name ?? 'Uncategorized',
      render: ({ value }) => <span>{String(value)}</span>,
    },
    {
      key: 'type',
      title: 'Type',
      render: ({ value, row }) => (
        <Badge size="sm" appearance="soft" subtheme={value === 'reimbursable' ? 'info' : undefined}>
          {value === 'reimbursable' ? (row.reimbursed ? 'Reimbursed' : 'Reimbursable') : 'Discretionary'}
        </Badge>
      ),
    },
    { key: 'description', title: 'Description' },
    {
      key: 'amount',
      title: 'Amount',
      sortable: true,
      render: ({ value }) => <span>${(value as number).toFixed(2)}</span>,
      width: '6.5rem',
    },
    {
      key: 'actions',
      title: '',
      width: '9rem',
      render: ({ row }) => (
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          {row.type === 'reimbursable' && !row.reimbursed && (
            <Button variant="outline" size="sm" onClick={() => updateTransaction(row.id, { reimbursed: true })}>
              Mark reimbursed
            </Button>
          )}
          <Tooltip content="Delete transaction">
            <Button variant="ghost" size="sm" icon="🗑️" aria-label="Delete transaction" onClick={() => deleteTransaction(row.id)} />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 0.875rem', borderBottom: '0.0625rem solid var(--ai-border)' }}>
        <span style={{ fontWeight: 600, fontSize: '0.9375rem', flex: 1 }}>💳 Ledger</span>
        <Tooltip content="Previous month">
          <Button variant="outline" size="sm" icon="◀" aria-label="Previous month" onClick={() => shiftMonth(-1)} />
        </Tooltip>
        <DatePicker
          value={monthDate}
          onChange={(d) => d && setMonthDate(d)}
          aria-label="Jump to month"
          size="sm"
        />
        <Tooltip content="Next month">
          <Button variant="outline" size="sm" icon="▶" aria-label="Next month" onClick={() => shiftMonth(1)} />
        </Tooltip>
        <TransactionForm />
      </div>

      <div style={{ flex: '1 1 0px', minHeight: 0 }}>
        <Splitter orientation="horizontal" initialSplit={60} minSize={25}>
          <Splitter.Panel>
            <div style={{ height: '100%', padding: '0.75rem' }}>
              {monthTransactions.length === 0 ? (
                <EmptyState>
                  <EmptyState.Title>No transactions in {formatMonthLabel(monthDate)}</EmptyState.Title>
                </EmptyState>
              ) : (
                <DataTable
                  data={monthTransactions}
                  columns={columns}
                  rowKey={(row) => row.id}
                  defaultSortKey="date"
                  defaultSortDirection="desc"
                />
              )}
            </div>
          </Splitter.Panel>
          <Splitter.Panel>
            <div style={{ height: '100%', overflowY: 'auto', padding: '0.75rem' }}>
              <Card>
                <Card.Header>{formatMonthLabel(monthDate)}</Card.Header>
                <Card.Content>
                  <CategoryBreakdownChart categories={categories} transactions={monthTransactions} />
                </Card.Content>
              </Card>
            </div>
          </Splitter.Panel>
        </Splitter>
      </div>
    </div>
  );
}
