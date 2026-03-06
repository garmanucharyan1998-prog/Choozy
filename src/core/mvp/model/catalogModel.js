/**
 * Catalog Model — data for grid catalog section.
 * MVP: Model — data access only, no UI logic.
 */

export const getCatalogItems = () => [
  {
    id: 'smartphones',
    label: '\u054D\u0574\u0561\u0580\u0569\u0586\u0578\u0576',
    image: '/assets/images/gridCatalog/smartphone.png',
    className: 'item-1 grid-item',
  },
  {
    id: 'speakers',
    label: '\u0547\u0561\u0580\u056A\u0561\u056F\u0561\u0576 \u0562\u0561\u0580\u0571\u0580\u0561\u056D\u0578\u057D\u0576\u0565\u0580',
    image: '/assets/images/gridCatalog/headphone.png',
    className: 'item-2 grid-item',
  },
  {
    id: 'laptops-1',
    label: '\u0546\u0578\u0569\u0562\u0578\u0582\u0584\u0565\u0580',
    image: '/assets/images/gridCatalog/notebook.png',
    className: 'item-3 grid-item',
  },
  {
    id: 'laptops-2',
    label: '\u0546\u0578\u0569\u0562\u0578\u0582\u0584\u0565\u0580',
    image: '/assets/images/gridCatalog/notebook.png',
    className: 'item-4 grid-item',
  },
  {
    id: 'speakers-2',
    label: '\u0547\u0561\u0580\u056A\u0561\u056F\u0561\u0576 \u0562\u0561\u0580\u0571\u0580\u0561\u056D\u0578\u057D\u0576\u0565\u0580',
    image: '/assets/images/gridCatalog/headphone.png',
    className: 'item-5 grid-item',
  },
  {
    id: 'headphones',
    label: 'SONY:\u0531\u056F\u0561\u0576\u057B\u0561\u056F\u0561\u056C\u0576\u0565\u0580',
    image: '/assets/images/gridCatalog/earphones.png',
    className: 'item-6 grid-item',
  },
];

export const catalogModel = { getCatalogItems };
export default catalogModel;
