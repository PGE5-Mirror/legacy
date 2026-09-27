export interface Item {
    id: string;
    name: string;
    completed: boolean;
}

export type ItemCallback = (item: Item) => void;

export interface AuthHeaders {
    'Content-Type': string;
    'Authorization': string;
}