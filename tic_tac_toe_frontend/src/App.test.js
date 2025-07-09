import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders Tic Tac Toe title', () => {
  render(<App />);
  expect(screen.getByText(/Tic Tac Toe/i)).toBeInTheDocument();
});

test('renders board and sidebar', () => {
  render(<App />);
  expect(screen.getByText(/Score/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /New Game/i })).toBeInTheDocument();
  expect(screen.getByRole('combobox')).toBeInTheDocument();
  // There should be 9 squares
  expect(screen.getAllByRole('button')).toHaveLength(
    // 9 board + new game btn
    10
  );
});

test('can play a move and see X on first click', () => {
  render(<App />);
  // Find one empty cell and click
  const boardBtns = screen.getAllByRole('button').filter(btn => btn.textContent === '');
  fireEvent.click(boardBtns[0]);
  // Now there should be an X
  expect(boardBtns[0].textContent).toBe('X');
});
