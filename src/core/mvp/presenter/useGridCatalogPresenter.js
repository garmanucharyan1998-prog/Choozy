/**
 * useGridCatalogPresenter — MVP Presenter for GridCatalog section.
 * Loads catalog items from Model, passes to View.
 */

import { useMemo } from 'react';
import { catalogModel } from '../model/catalogModel';

export const useGridCatalogPresenter = () => {
  const items = useMemo(() => catalogModel.getCatalogItems(), []);

  return { items };
};

export default useGridCatalogPresenter;
