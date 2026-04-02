import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';

import App from './App';

describe('App component', () => {
  test('renders dormdeals heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /dormdeals/i })).toBeInTheDocument();
  });

  test('search filters listings by text', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText(/Comfortable office chair/i)).toBeInTheDocument();
    await user.type(
      screen.getByPlaceholderText(/Search furniture, neighborhoods.../i),
      'bookshelf',
    );

    expect(screen.queryByText(/Comfortable office chair/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Bookshelf with adjustable shelves/i)).toBeInTheDocument();
  });

  test('tag selection uses OR', async () => {
    const user = userEvent.setup();
    render(<App />);

    const chairButton = screen.getByRole('button', { name: /Chair/i });
    const deskButton = screen.getByRole('button', { name: /Desk/i });

    await user.click(chairButton);
    await user.click(deskButton);

    expect(screen.getByText(/Comfortable office chair/i)).toBeInTheDocument();
    expect(screen.getByText(/Modern wooden study desk/i)).toBeInTheDocument();
  });

  test('add new listing via form and listing appears', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /add a listing/i }));

    await user.type(screen.getByLabelText(/Image URL/i), 'https://example.com/test.jpg');
    await user.type(screen.getByLabelText(/Price/i), '120');
    await user.type(screen.getByLabelText(/Neighborhood/i), 'TestTown');
    await user.selectOptions(screen.getByLabelText(/Condition/i), 'New');
    await user.type(screen.getByLabelText(/Tags/i), 'armchair, cozy');
    await user.type(screen.getByLabelText(/Description/i), 'Test armchair');

    await user.click(screen.getByRole('button', { name: /add listing/i }));

    expect(
      await screen.findByRole('heading', { name: /Test armchair/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('$120')).toBeInTheDocument();
  });
});
