/**
 * useNavPanelPresenter — MVP Presenter for NavPanel.
 * Loads nav items from Model and marks the one matching the current filter category.
 */

import { useMemo } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { navModel } from "entities/navigation";
import { useLanguage } from "contexts";
import { stripLanguageFromPath } from "shared/lib/locale";

export const useNavPanelPresenter = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const navItems = useMemo(
    () =>
      navModel.getNavItems().map((item) => ({
        ...item,
        label: t(item.labelKey, item.id),
      })),
    [t],
  );

  /** Active state now follows the URL instead of local click state. */
  const activeCategoryId =
    stripLanguageFromPath(location.pathname) === "/filter" ? searchParams.get("category") : null;

  return { navItems, activeCategoryId };
};

export default useNavPanelPresenter;
