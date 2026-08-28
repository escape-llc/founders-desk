import { useState } from 'react';
import { z } from 'zod';
import { Modal, Button, Form, FormField, Input, RadioGroup, SubmitButton, Tooltip, aiBus } from '#toolcrib';
import useNotebookStore from '../../store/notebookStore';

const newNodeSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  type: z.enum(['folder', 'notebook']),
});

export default function NewNodeModal({ parentId }: { parentId: number | null }) {
  const [formKey, setFormKey] = useState(0);
  const { createNode } = useNotebookStore();

  const handleSubmit = async ({ name, type }: z.infer<typeof newNodeSchema>) => {
    await createNode(name, type, parentId);
    aiBus.showToast(`${type === 'folder' ? 'Folder' : 'Notebook'} created`, 'success');
    aiBus.closeModal('new-node-modal');
    setFormKey((k) => k + 1);
  };

  return (
    <Modal id="new-node-modal" trigger={<Tooltip content="New folder or notebook"><Button variant="outline" size="sm" icon="＋" aria-label="New folder or notebook" /></Tooltip>} ariaLabel="New folder or notebook" width="24rem">
      <Modal.Header>New Folder or Notebook</Modal.Header>
      <Modal.Body>
        <Form key={formKey} id="new-node-form" schema={newNodeSchema} initialValues={{ type: 'notebook' }} onSubmit={handleSubmit}>
          <FormField name="name" label="Name">
            <Input placeholder="e.g. Investor Updates" autoFocus />
          </FormField>
          <FormField name="type" label="Type">
            <RadioGroup
              direction="horizontal"
              options={[
                { label: 'Notebook', value: 'notebook' },
                { label: 'Folder', value: 'folder' },
              ]}
            />
          </FormField>
          <SubmitButton variant="primary">Create</SubmitButton>
        </Form>
      </Modal.Body>
      <Modal.Actions>
        <Modal.CloseButton />
      </Modal.Actions>
    </Modal>
  );
}
