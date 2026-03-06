/**
 * Nav Model — data for navigation panel.
 * MVP: Model — data access only, no UI logic.
 */

export const getNavItems = () => [
  { label: '\u054F\u0565\u056D\u0576\u056B\u056F\u0561 \u0587 \u0567\u056C\u0565\u056F\u057F\u0580\u0578\u0576\u056B\u056F\u0561', aria: 'Tech and Electronics' },
  { label: '\u0547\u0561\u0580\u056A\u0561\u056F\u0561\u0576 \u0562\u0561\u0580\u0571\u0580\u0561\u056D\u0578\u057D\u0576\u0565\u0580', aria: 'Portable Speakers' },
  { label: '\u053F\u0565\u0576\u0581\u0561\u0572\u0561\u0575\u056B\u0576 \u054F\u0565\u056D\u0576\u056B\u056F\u0561', aria: 'Home Appliances' },
  { label: '\u053D\u0578\u0570\u0561\u0576\u0578\u0581\u0561\u0575\u056B\u0576 \u054F\u0565\u056D\u0576\u056B\u056F\u0561', aria: 'Kitchen Appliances' },
  { label: '\u0533\u0565\u0572\u0565\u0581\u056F\u0578\u0582\u0569\u0575\u0578\u0582\u0576 \u0587 \u056D\u0576\u0561\u0574\u0584', aria: 'Beauty and Care' },
];

export const navModel = { getNavItems };
export default navModel;
