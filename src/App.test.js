import { render, screen } from '@testing-library/react';
import App from 'app/App';
import { translations } from 'shared/i18n';
import { DEFAULT_LANGUAGE_CODE } from 'shared/i18n/languageConfig';

jest.mock('shared/ui/carousel', () => ({
  Carousel: () => <div data-testid="carousel-mock" />,
}));

/** Async: routes are code-split, so the tree renders behind a Suspense boundary. */
test('renders main search input', async () => {
  render(<App />);
  /**
   * The accessible name comes from the dictionary rather than a hard-coded English
   * string — it is localised now, so a literal would break on every copy change.
   */
  /** `combobox`, not `searchbox`: the field carries an explicit role for its suggestions. */
  const searchInput = await screen.findByRole('combobox', {
    name: translations[DEFAULT_LANGUAGE_CODE].header.search.inputAriaLabel,
  });
  expect(searchInput).toBeInTheDocument();
});
