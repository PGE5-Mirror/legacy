# Getting started

This repository is a sample application for users following the getting started guide at https://docs.docker.com/get-started/.

The application is based on the application from the getting started tutorial at https://github.com/docker/getting-started


## Code quality
- `npm run lint` — runs ESLint
- `npm run format` — runs Prettier

## Testing
`npm test` runs every test (backend and frontend) with a coverage report. Jest runs them as two projects (see `jest.config.js`):

| Project | Environment | Where the specs live |
|---|---|---|
| `backend` | Node | `spec/**/*.spec.ts` (everything except `spec/client/`) |
| `frontend` | jsdom (browser-like) | `spec/client/**/*.spec.tsx` |

- Run only one project: `npx jest --selectProjects frontend`
- Run one file: `npx jest spec/client/components/KanbanBoard.spec.tsx`

Frontend tests use [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) (v12, because the app uses React 16) and the matchers from `@testing-library/jest-dom`. The reasoning is in [ADR 004](docs/adr/004-frontend-testing.md).

### Writing a frontend test
Mock the shared `apiRequest` helper so no server is needed, render the component, then interact with it the way a user would (visible text, labels, buttons):

```tsx
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MyComponent } from '../../../src/client/components/MyComponent';
import { apiRequest } from '../../../src/client/api';

jest.mock('../../../src/client/api');
const mockedRequest = apiRequest as jest.Mock;

it('shows the saved item after clicking Save', async () => {
  mockedRequest.mockResolvedValue({ id: '1', name: 'My item' });
  render(<MyComponent />);

  fireEvent.click(screen.getByRole('button', { name: 'Save' }));

  expect(await screen.findByText('My item')).toBeInTheDocument();
});
```

For a complete example (fake server, creating, assigning and moving tasks, error messages), see `spec/client/components/KanbanBoard.spec.tsx`.