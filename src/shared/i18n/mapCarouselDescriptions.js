/**
 * Maps carousel mock items to localized descriptions via translation keys.
 */
export const localizeCarouselItems = (items, t) =>
  items.map((item) => ({
    ...item,
    description: item.descriptionKey ? t(item.descriptionKey) : item.description ?? "",
  }));

export default localizeCarouselItems;
