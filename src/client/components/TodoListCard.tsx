import React, { useState, useEffect, useCallback } from 'react';
import { Item, AuthHeaders } from '../types';
import { AddItemForm } from './AddItemForm';
import { ItemDisplay } from './ItemDisplay';

interface TodoListCardProps {
    token: string;
}

export function TodoListCard({ token }: TodoListCardProps) {
    const [items, setItems] = useState<Item[] | null>(null);

    const authHeaders: AuthHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };

    useEffect(() => {
        fetch('/items', { headers: { Authorization: `Bearer ${token}` } })
            .then((r) => {
                if (r.status === 401) {
                    localStorage.removeItem('authToken');
                    window.location.reload();
                }
                return r.json() as Promise<Item[]>;
            })
            .then((data) => setItems(Array.isArray(data) ? data : []))
            .catch(() => setItems([]));
    }, [token]);

    const onNewItem = useCallback((newItem: Item) => {
        setItems((prev) => (prev ? [...prev, newItem] : [newItem]));
    }, []);

    const onItemUpdate = useCallback((updatedItem: Item) => {
        setItems((prev) => (prev ? prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)) : prev));
    }, []);

    const onItemRemoval = useCallback((removedItem: Item) => {
        setItems((prev) => (prev ? prev.filter((i) => i.id !== removedItem.id) : prev));
    }, []);

    if (items === null) return <p className="text-center mt-5">Loading...</p>;

    return (
        <>
            <AddItemForm onNewItem={onNewItem} authHeaders={authHeaders} />
            {items.length === 0 && <p className="text-center">No items yet! Add one above!</p>}
            {items.map((item) => (
                <ItemDisplay
                    key={item.id}
                    item={item}
                    onItemUpdate={onItemUpdate}
                    onItemRemoval={onItemRemoval}
                    authHeaders={authHeaders}
                />
            ))}
        </>
    );
}