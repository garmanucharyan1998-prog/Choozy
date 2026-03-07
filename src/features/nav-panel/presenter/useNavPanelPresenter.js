/**
 * useNavPanelPresenter — MVP Presenter for NavPanel.
 * Loads nav items from Model, manages active state, passes to View.
 */

import { useState, useMemo, useCallback } from "react";
import { navModel } from "entities/navigation";

export const useNavPanelPresenter = () => {
  const navItems = useMemo(() => navModel.getNavItems(), []);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSelect = useCallback((index) => {
    setActiveIndex(index);
  }, []);

  return { navItems, activeIndex, handleSelect };
};

export default useNavPanelPresenter;
