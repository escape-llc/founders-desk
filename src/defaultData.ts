import { subDays, format } from 'date-fns';
import type { NotebookNode, CategoryRecord, TransactionRecord } from './types';
import type { InsertType } from 'dexie';

/**
 * Seed content for a fictitious CEO persona (Acme Analytics) so the app
 * isn't empty on first launch. Transaction/note dates are generated
 * relative to "today" (not hardcoded) so the Overview's "this month" KPIs
 * always have something real to show regardless of when this is run.
 */

type SeedNode = Omit<InsertType<NotebookNode, 'id'>, 'parentId'> & { tempId: string; parentTempId?: string };

export const SEED_NOTEBOOK_NODES: SeedNode[] = [
  { tempId: 'journal', type: 'notebook', name: 'Daily Journal' },
  { tempId: 'board-folder', type: 'folder', name: 'Board & Investors' },
  { tempId: 'board-notebook', type: 'notebook', name: 'Board Meetings', parentTempId: 'board-folder' },
  { tempId: 'oneones-folder', type: 'folder', name: 'Leadership 1:1s' },
  { tempId: 'oneone-sarah', type: 'notebook', name: '1:1 — Sarah (VP Eng)', parentTempId: 'oneones-folder' },
  { tempId: 'oneone-marcus', type: 'notebook', name: '1:1 — Marcus (VP Sales)', parentTempId: 'oneones-folder' },
  { tempId: 'strategy-folder', type: 'folder', name: 'Strategy' },
  { tempId: 'roadmap', type: 'notebook', name: '2026 Roadmap', parentTempId: 'strategy-folder' },
];

interface SeedNote {
  notebookTempId: string;
  title: string;
  content: string;
  daysAgo: number;
}

export const SEED_NOTES: SeedNote[] = [
  {
    notebookTempId: 'journal',
    title: 'Monday check-in',
    daysAgo: 2,
    content:
      '# Monday check-in\n\nQuiet start to the week. Spent the morning on inbox zero and reviewing last week\'s metrics.\n\n' +
      '- MRR growth held steady at 4% MoM\n' +
      '- Support ticket volume down slightly\n\n' +
      '#action Follow up with legal on the Acme-Vendor NDA by Friday\n',
  },
  {
    notebookTempId: 'journal',
    title: 'Notes from the all-hands',
    daysAgo: 5,
    content:
      '# Notes from the all-hands\n\nGood energy in the room. A few things to chase down afterward:\n\n' +
      '#action Send the updated org chart to People Ops\n' +
      '#action Book the Q2 offsite venue before it gets booked up\n',
  },
  {
    notebookTempId: 'board-notebook',
    title: 'Q1 Board Meeting Notes',
    daysAgo: 10,
    content:
      '# Q1 Board Meeting Notes\n\n**Attendees:** Full board, CFO, VP Eng\n\n## Discussion\n\n' +
      'Board was pleased with retention numbers. Pushed on burn rate given the new hires in Eng.\n\n' +
      '#action Prepare updated cap table for the next board reference\n' +
      '#action Get a revised 18-month runway model from Finance\n',
  },
  {
    notebookTempId: 'oneone-sarah',
    title: '1:1 — Sarah, week of the sprint review',
    daysAgo: 3,
    content:
      '# 1:1 — Sarah\n\nDiscussed the platform migration timeline slipping by two weeks. Not a big deal on its own, ' +
      'but it is the third slip this quarter.\n\n#action Review eng headcount plan before the next 1:1\n',
  },
  {
    notebookTempId: 'oneone-marcus',
    title: '1:1 — Marcus, pipeline review',
    daysAgo: 6,
    content:
      '# 1:1 — Marcus\n\nPipeline looks healthy for next quarter. Marcus flagged that the biggest enterprise deal ' +
      'needs a security questionnaire turned around quickly.\n\n#action Loop in security team on the enterprise deal questionnaire\n',
  },
  {
    notebookTempId: 'roadmap',
    title: '2026 pricing changes',
    daysAgo: 8,
    content:
      '# 2026 pricing changes\n\nLeaning toward simplifying from four tiers down to three. Need product and finance ' +
      'sign-off before this goes anywhere near customers.\n\n#action Finalize pricing tier changes with product team\n',
  },
];

export const SEED_CATEGORIES: InsertType<CategoryRecord, 'id'>[] = [
  { name: 'Travel', monthlyBudget: 2000 },
  { name: 'Meals & Entertainment', monthlyBudget: 800 },
  { name: 'Software & Subscriptions', monthlyBudget: 500 },
  { name: 'Office', monthlyBudget: 300 },
  { name: 'Professional Development', monthlyBudget: 400 },
  { name: 'Team Events', monthlyBudget: 600 },
];

interface SeedTransaction {
  categoryName: string;
  type: TransactionRecord['type'];
  amount: number;
  description: string;
  reimbursed: boolean;
  /**
   * Day of the current month (1-28, so it's always valid regardless of
   * which month this happens to run in) -- deliberately NOT "days ago
   * from today" like the notes below. A days-ago offset up to 28 can
   * roll into the *previous* calendar month depending on today's actual
   * date, which would silently drop that transaction out of the
   * Overview/Ledger's "this month" view (and out of whatever the e2e
   * suite asserts is visible there) depending purely on which day of the
   * month the app happens to run on.
   */
  dayOfMonth: number;
}

export const SEED_TRANSACTIONS: SeedTransaction[] = [
  { categoryName: 'Travel', type: 'reimbursable', amount: 612.4, description: 'Flight — investor meetings (SFO)', reimbursed: true, dayOfMonth: 1 },
  { categoryName: 'Travel', type: 'reimbursable', amount: 218.0, description: 'Hotel — one night, board meeting', reimbursed: false, dayOfMonth: 20 },
  { categoryName: 'Meals & Entertainment', type: 'reimbursable', amount: 142.5, description: 'Dinner with lead investor', reimbursed: false, dayOfMonth: 25 },
  { categoryName: 'Meals & Entertainment', type: 'discretionary', amount: 38.75, description: 'Coffee — 1:1 with Marcus', dayOfMonth: 23, reimbursed: false },
  { categoryName: 'Software & Subscriptions', type: 'discretionary', amount: 49.0, description: 'Analytics dashboard subscription', dayOfMonth: 14, reimbursed: false },
  { categoryName: 'Software & Subscriptions', type: 'discretionary', amount: 20.0, description: 'Note-taking app, personal tier', dayOfMonth: 27, reimbursed: false },
  { categoryName: 'Office', type: 'discretionary', amount: 64.3, description: 'Desk supplies restock', dayOfMonth: 17, reimbursed: false },
  { categoryName: 'Professional Development', type: 'reimbursable', amount: 299.0, description: 'Leadership workshop — Q1', reimbursed: true, dayOfMonth: 8 },
  { categoryName: 'Team Events', type: 'discretionary', amount: 180.0, description: 'Team lunch — sprint wrap-up', dayOfMonth: 24, reimbursed: false },
  { categoryName: 'Travel', type: 'reimbursable', amount: 87.2, description: 'Rideshare — airport to investor office', reimbursed: false, dayOfMonth: 26 },
  { categoryName: 'Meals & Entertainment', type: 'reimbursable', amount: 96.0, description: 'Client dinner — renewal discussion', reimbursed: false, dayOfMonth: 28 },
  { categoryName: 'Office', type: 'discretionary', amount: 22.99, description: 'Notebook and pens', dayOfMonth: 4, reimbursed: false },
];

export function seedDate(daysAgo: number): string {
  return format(subDays(new Date(), daysAgo), 'yyyy-MM-dd');
}

/** Always lands within the current calendar month -- see `SeedTransaction.dayOfMonth`'s own comment for why. */
export function seedDateForDayOfMonth(dayOfMonth: number): string {
  const now = new Date();
  return format(new Date(now.getFullYear(), now.getMonth(), dayOfMonth), 'yyyy-MM-dd');
}

export function seedIsoTimestamp(daysAgo: number): string {
  return subDays(new Date(), daysAgo).toISOString();
}
