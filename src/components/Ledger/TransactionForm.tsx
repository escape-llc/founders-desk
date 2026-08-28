import { useState } from 'react';
import { z } from 'zod';
import { Modal, Button, Form, FormField, Input, Select, RadioGroup, Checkbox, SubmitButton, Tooltip, aiBus, useOptionalFormContext } from '#toolcrib';
import useLedgerStore from '../../store/ledgerStore';
import { seedDate } from '../../defaultData';

const transactionSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  categoryId: z.string().min(1, 'Select a category'),
  type: z.enum(['discretionary', 'reimbursable']),
  amount: z.coerce.number().positive('Enter an amount greater than 0'),
  description: z.string().trim().min(1, 'Description is required'),
  reimbursed: z.boolean().optional(),
});

/** Reads the live `type` value from Form context so the Reimbursed checkbox only shows up for reimbursable transactions. */
function ReimbursedField() {
  const form = useOptionalFormContext();
  if (form?.values.type !== 'reimbursable') return null;
  return (
    <FormField name="reimbursed">
      <Checkbox label="Already reimbursed" />
    </FormField>
  );
}

export default function TransactionForm() {
  const [formKey, setFormKey] = useState(0);
  const { categories, addTransaction } = useLedgerStore();

  const handleSubmit = async (values: z.infer<typeof transactionSchema>) => {
    // <Form> only runs the schema for validation -- the values it hands to
    // onSubmit are the raw field state (every Input, including this one's
    // amount, always stores a string), never the coerced/transformed
    // output `schema.safeParse` produced. z.coerce.number() above still
    // does real work (rejecting non-numeric/zero/negative input before
    // this ever runs), but the actual value here still needs its own
    // Number(...) conversion, same as categoryId below.
    await addTransaction({
      date: values.date,
      categoryId: Number(values.categoryId),
      type: values.type,
      amount: Number(values.amount),
      description: values.description,
      reimbursed: values.type === 'reimbursable' ? !!values.reimbursed : false,
    });
    aiBus.showToast('Transaction added', 'success');
    aiBus.closeModal('new-transaction-modal');
    setFormKey((k) => k + 1);
  };

  return (
    <Modal
      id="new-transaction-modal"
      trigger={
        <Tooltip content="Add transaction">
          <Button variant="primary" size="sm" icon="＋" aria-label="Add transaction" />
        </Tooltip>
      }
      ariaLabel="Add a transaction"
      width="26rem"
    >
      <Modal.Header>Add a Transaction</Modal.Header>
      <Modal.Body>
        <Form
          key={formKey}
          id="new-transaction-form"
          schema={transactionSchema}
          initialValues={{ date: seedDate(0), type: 'discretionary', reimbursed: false }}
          onSubmit={handleSubmit}
        >
          <FormField name="date" label="Date">
            <Input type="date" />
          </FormField>
          <FormField name="categoryId" label="Category">
            <Select
              placeholder="Select a category..."
              options={categories.map((c) => ({ label: c.name, value: String(c.id) }))}
              defaultValue=""
            />
          </FormField>
          <FormField name="type" label="Type">
            <RadioGroup
              direction="horizontal"
              options={[
                { label: 'Discretionary', value: 'discretionary' },
                { label: 'Reimbursable', value: 'reimbursable' },
              ]}
            />
          </FormField>
          <FormField name="amount" label="Amount ($)">
            <Input type="number" step="0.01" min="0" placeholder="0.00" />
          </FormField>
          <FormField name="description" label="Description">
            <Input placeholder="e.g. Client dinner" />
          </FormField>
          <ReimbursedField />
          <SubmitButton variant="primary">Add Transaction</SubmitButton>
        </Form>
      </Modal.Body>
      <Modal.Actions>
        <Modal.CloseButton />
      </Modal.Actions>
    </Modal>
  );
}
