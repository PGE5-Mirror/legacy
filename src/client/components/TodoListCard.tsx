import React, { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-bootstrap';
import { apiRequest } from '../api';
import { Item } from '../types';
import { AddItemForm } from './AddItemForm';
import { ItemDisplay } from './ItemDisplay';

export function TodoListCard() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest<Item[]>('/items')
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch((err: Error) => {
        setError(err.message);
        setItems([]);
      });
  }, []);

  const onNewItem = useCallback((newItem: Item) => {
    setItems((prev) => (prev ? [...prev, newItem] : [newItem]));
  }, []);

  const onItemUpdate = useCallback((updatedItem: Item) => {
    setItems((prev) =>
      prev ? prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)) : prev,
    );
  }, []);

  const onItemRemoval = useCallback((removedItem: Item) => {
    setItems((prev) => (prev ? prev.filter((i) => i.id !== removedItem.id) : prev));
  }, []);

  if (items === null) return <p className="text-center mt-5">Loading...</p>;

  return (
    <>
      {error && <Alert variant="danger">{error}</Alert>}
      <AddItemForm onNewItem={onNewItem} />
      {items.length === 0 && <p className="text-center">No items yet! Add one above!</p>}
      {items.map((item) => (
        <ItemDisplay
          key={item.id}
          item={item}
          onItemUpdate={onItemUpdate}
          onItemRemoval={onItemRemoval}
        />
      ))}
    </>
  );
}
