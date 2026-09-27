import React, { useState } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { Item, ItemCallback, AuthHeaders } from '../types';

interface AddItemFormProps {
    onNewItem: ItemCallback;
    authHeaders: AuthHeaders;
}

export function AddItemForm({ onNewItem, authHeaders }: AddItemFormProps) {
    const [newItem, setNewItem] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const submitNewItem = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        fetch('/items', {
            method: 'POST',
            body: JSON.stringify({ name: newItem }),
            headers: authHeaders as unknown as Record<string, string>,
        })
            .then((r) => r.json() as Promise<Item>)
            .then((item) => {
                onNewItem(item);
                setSubmitting(false);
                setNewItem('');
            })
            .catch(() => setSubmitting(false));
    };

    return (
        <Form onSubmit={submitNewItem}>
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