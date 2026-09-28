import React, { useState } from 'react';
import { Alert, Container, Row, Col, Button } from 'react-bootstrap';
import { apiRequest } from '../api';
import { Item, ItemCallback } from '../types';

interface ItemDisplayProps {
  item: Item;
  onItemUpdate: ItemCallback;
  onItemRemoval: ItemCallback;
}

export function ItemDisplay({ item, onItemUpdate, onItemRemoval }: ItemDisplayProps) {
  const [error, setError] = useState('');

  const toggleCompletion = () => {
    setError('');

    apiRequest<Item>(`/items/${item.id}`, {
      method: 'PUT',
      body: JSON.stringify({ name: item.name, completed: !item.completed }),
    })
      .then(onItemUpdate)
      .catch((err: Error) => setError(err.message));
  };

  const removeItem = () => {
    setError('');

    apiRequest<void>(`/items/${item.id}`, { method: 'DELETE' })
      .then(() => onItemRemoval(item))
      .catch((err: Error) => setError(err.message));
  };

  return (
    <Container fluid className={`item ${item.completed ? 'completed' : ''}`}>
      <Row>
        <Col xs={1} className="text-center">
          <Button size="sm" variant="link" onClick={toggleCompletion}>
            <i className={`far ${item.completed ? 'fa-check-square' : 'fa-square'}`} />
          </Button>
        </Col>
        <Col xs={10} className="name">
          {item.name}
        </Col>
        <Col xs={1} className="text-center remove">
          <Button size="sm" variant="link" onClick={removeItem}>
            <i className="fa fa-trash text-danger" />
          </Button>
        </Col>
      </Row>
      {error && (
        <Alert variant="danger" className="mt-2 mb-0">
          {error}
        </Alert>
      )}
    </Container>
  );
}
