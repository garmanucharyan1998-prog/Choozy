/**
 * useServicesPresenter — MVP Presenter for ServicesOverview section.
 * Loads services data from Model, passes to View.
 */

import { useMemo } from "react";
import { servicesModel } from "entities/service";

export const useServicesPresenter = () => {
  const services = useMemo(() => servicesModel.getServices(), []);

  return { services };
};

export default useServicesPresenter;
