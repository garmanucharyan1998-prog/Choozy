import { render, screen } from '@testing-library/react';
import App from 'app/App';

jest.mock('shared/ui/carousel', () => ({
  Carousel: () => <div data-testid="carousel-mock" />,
}));

test('renders main search input', () => {
  render(<App />);
  const searchInput = screen.getByRole('searchbox', {
    name: /search for products and services/i,
  });
  expect(searchInput).toBeInTheDocument();
});
