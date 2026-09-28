import React, { useState } from 'react';
import { Alert, Form, InputGroup, Button } from 'react-bootstrap';
import { apiRequest } from '../api';
import { Item, ItemCallback } from '../types';

interface AddItemFormProps {
  onNewItem: ItemCallback;
}

export function AddItemForm({ onNewItem }: AddItemFormProps) {
  const [newItem, setNewItem] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submitNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    apiRequest<Item>('/items', {
      method: 'POST',
      body: JSON.stringify({ name: newItem }),
    })
      .then((item) => {
        onNewItem(item);
        setNewItem('');
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setSubmitting(false));
  };

  return (
    <Form onSubmit={submitNewItem}>
      {error && <Alert variant="danger">{error}</Alert>}
      <InputGroup className="mb-3">
        <Form.Control
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          type="text"
          placeholder="New Item"
        />
        <Button type="submit" variant="success" disabled={!newItem.length || submitting}>
          {submitting ? 'Adding...' : 'Add Item'}
        </Button>
      </InputGroup>
    </Form>
  );
}
