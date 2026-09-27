import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Item, ItemCallback, AuthHeaders } from '../types';

interface ItemDisplayProps {
    item: Item;
    onItemUpdate: ItemCallback;
    onItemRemoval: ItemCallback;
    authHeaders: AuthHeaders;
}

export function ItemDisplay({ item, onItemUpdate, onItemRemoval, authHeaders }: ItemDisplayProps) {
    const toggleCompletion = () => {
        fetch(`/items/${item.id}`, {
            method: 'PUT',
            body: JSON.stringify({ name: item.name, completed: !item.completed }),
            headers: authHeaders as unknown as Record<string, string>,
        })
            .then((r) => r.json() as Promise<Item>)
            .then(onItemUpdate);
    };

    const removeItem = () => {
        fetch(`/items/${item.id}`, {
            method: 'DELETE',
            headers: authHeaders as unknown as Record<string, string>,
        }).then(() => onItemRemoval(item));
    };

    return (
        <Container fluid className={`item ${item.completed ? 'completed' : ''}`}>
            <Row>
                <Col xs={1} className="text-center">
                    <Button size="sm" variant="link" onClick={toggleCompletion}>
                        <i className={`far ${item.completed ? 'fa-check-square' : 'fa-square'}`} />
                    </Button>
                </Col>
                <Col xs={10} className="name">{item.name}</Col>
                <Col xs={1} className="text-center remove">
                    <Button size="sm" variant="link" onClick={removeItem}>
                        <i className="fa fa-trash text-danger" />
                    </Button>
                </Col>
            </Row>
        </Container>
    );
}