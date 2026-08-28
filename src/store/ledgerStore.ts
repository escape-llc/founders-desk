import { create } from 'zustand';
import type { InsertType } from 'dexie';
import db from '../db';
import type { CategoryRecord, TransactionRecord } from '../types';
import { SEED_CATEGORIES, SEED_TRANSACTIONS, seedDateForDayOfMonth } from '../defaultData';

/** Guard against React StrictMode double-mounting seeding default data twice. */
let _seeding = false;

interface LedgerStore {
  categories: CategoryRecord[];
  transactions: TransactionRecord[];

  loadFromDB: () => Promise<void>;
  addTransaction: (record: Omit<InsertType<TransactionRecord, 'id'>, 'id'>) => Promise<void>;
  updateTransaction: (id: number, changes: Partial<TransactionRecord>) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;
  addCategory: (name: string, monthlyBudget: number) => Promise<void>;
}

async function reloadAll(set: (partial: Partial<LedgerStore>) => void) {
  const categories = await db.categories.toArray();
  const transactions = await db.transactions.orderBy('date').reverse().toArray();
  set({ categories, transactions });
}

const useLedgerStore = create<LedgerStore>((set, get) => ({
  categories: [],
  transactions: [],

  loadFromDB: async () => {
    await reloadAll(set);

    if (get().categories.length === 0 && !_seeding) {
      _seeding = true;
      const nameToId = new Map<string, number>();

      for (const category of SEED_CATEGORIES) {
        const id = await db.categories.add(category);
        nameToId.set(category.name, id);
      }

      for (const seedTx of SEED_TRANSACTIONS) {
        const categoryId = nameToId.get(seedTx.categoryName);
        if (categoryId === undefined) continue;
        const record: InsertType<TransactionRecord, 'id'> = {
          date: seedDateForDayOfMonth(seedTx.dayOfMonth),
          categoryId,
          type: seedTx.type,
          amount: seedTx.amount,
          description: seedTx.description,
          reimbursed: seedTx.reimbursed,
        };
        await db.transactions.add(record);
      }

      await reloadAll(set);
      _seeding = false;
    }
  },

  addTransaction: async (record) => {
    await db.transactions.add(record);
    await reloadAll(set);
  },

  updateTransaction: async (id, changes) => {
    await db.transactions.update(id, changes);
    await reloadAll(set);
  },

  deleteTransaction: async (id) => {
    await db.transactions.delete(id);
    await reloadAll(set);
  },

  addCategory: async (name, monthlyBudget) => {
    await db.categories.add({ name, monthlyBudget });
    await reloadAll(set);
  },
}));

export default useLedgerStore;
