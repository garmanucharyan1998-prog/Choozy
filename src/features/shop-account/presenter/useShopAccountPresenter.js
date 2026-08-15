import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router";
import {
  getCatalogProductById,
  getCatalogProductsByCategory,
  getServerDefaultShopAccountState,
  getShopCategoryLabelKey,
  getShopColorOptionById,
  normalizeShopProduct,
  pruneStaleShopProducts,
  readShopAccountState,
  resolveShopMemoryLabel,
  SHOP_CATALOG_PRODUCTS,
  SHOP_COLOR_OPTIONS,
  SHOP_MEMORY_OPTIONS,
  SHOP_PRODUCT_CATEGORY_IDS,
  SHOP_ACCOUNT_PERSIST_ERROR_EVENT,
  SHOP_ACCOUNT_STORAGE_EVENT,
  SHOP_INNER_TABS,
  SHOP_NOTIFICATIONS_PAGE_TABS,
  SHOP_SIDEBAR_IDS,
  writeShopAccountState,
} from "entities/shop";
import { useLanguage } from "contexts";
import { formatAmd } from "shared/lib/formatAmd";
import { parseAmdInput } from "shared/lib/parseAmdInput";
import { stripLanguageFromPath, useLocalizedNavigate } from "shared/lib/locale";

const SHOP_ACCOUNT_PATH_BY_SIDEBAR = {
  [SHOP_SIDEBAR_IDS.DETAILS]: "/account/shop-account",
  [SHOP_SIDEBAR_IDS.PRODUCTS]: "/account/shop-account/products",
  [SHOP_SIDEBAR_IDS.STATISTICS]: "/account/shop-account/statistics",
  [SHOP_SIDEBAR_IDS.FINANCE]: "/account/shop-account/finance",
};

/**
 * What a status message *is*, not just what it says.
 *
 * Every message used to render in the same green "saved" panel, including
 * `avatarTooLarge` and every "you forgot a field" — an interface telling a seller their upload
 * failed while painting it as a success. Callers now name the tone, and the two error paths
 * (a rejected input, a write that could not be persisted) look like errors.
 */
export const SHOP_STATUS_TONES = {
  SUCCESS: "success",
  ERROR: "error",
  INFO: "info",
};

/** Long enough to read a confirmation, short enough not to sit over the next action. */
const STATUS_AUTO_DISMISS_MS = 5000;

/** How long a row shows "refreshed just now" — and stays un-clickable, so one click is one refresh. */
const REFRESH_ACK_MS = 2500;

const emptyProfileDraft = () => ({ ...readShopAccountState().profile });

const emptyProductDraft = () => ({
  categoryId: "",
  catalogProductId: "",
  price: "",
  availability: "in_stock",
  selectedMemoryIds: [],
  selectedColorIds: [],
});

const sidebarIdFromPathname = (pathname) => {
  const base = stripLanguageFromPath(pathname).replace(/\/$/, "") || "/account/shop-account";
  if (base === "/account/shop-account/products") return SHOP_SIDEBAR_IDS.PRODUCTS;
  if (base === "/account/shop-account/statistics") return SHOP_SIDEBAR_IDS.STATISTICS;
  if (base === "/account/shop-account/finance") return SHOP_SIDEBAR_IDS.FINANCE;
  return SHOP_SIDEBAR_IDS.DETAILS;
};

const newShopProductId = () =>
  typeof window !== "undefined" &&
  typeof window.crypto !== "undefined" &&
  typeof window.crypto.randomUUID === "function"
    ? `shop-${window.crypto.randomUUID()}`
    : `shop-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const formatShopPrice = (raw) => {
  const priceAmd = parseAmdInput(raw);
  if (priceAmd == null) return { price: "", priceAmd: undefined };
  return { price: formatAmd(priceAmd), priceAmd };
};

/**
 * @param {ReturnType<typeof normalizeShopProduct>} product
 * @param {(key: string) => string} t
 */
const productToDraft = (product, t) => {
  const catalog =
    SHOP_CATALOG_PRODUCTS.find((entry) => entry.id && entry.title === product.title) ?? null;
  const categoryId =
    product.categoryId ||
    catalog?.categoryId ||
    SHOP_PRODUCT_CATEGORY_IDS.find((id) => t(getShopCategoryLabelKey(id)) === product.category) ||
    "";

  const selectedMemoryIds = SHOP_MEMORY_OPTIONS.filter((option) => {
    const label = resolveShopMemoryLabel(option, t);
    return product.variants.includes(label);
  }).map((option) => option.id);

  const selectedColorIds = product.colors
    .map((color) => color.id)
    .filter((id) => SHOP_COLOR_OPTIONS.some((option) => option.id === id));

  const parsedPrice = parseAmdInput(product.price) ?? product.priceAmd;
  const price =
    typeof parsedPrice === "number" && Number.isFinite(parsedPrice) ? String(parsedPrice) : "";

  return {
    categoryId,
    catalogProductId: catalog?.id || "",
    price,
    availability: product.availability === "out_of_stock" ? "out_of_stock" : "in_stock",
    selectedMemoryIds,
    selectedColorIds,
  };
};

export const useShopAccountPresenter = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useLocalizedNavigate();

  /**
   * `readShopAccountState()` returns different data server vs client once a shop has real
   * stored data (profile edits, added products) — reading it directly here meant the first
   * client render (during hydration) already differed from the server's HTML, a React #418
   * mismatch. `getServerDefaultShopAccountState()` is the exact same expression the server
   * uses (not a hand-copied duplicate that could drift), so the first paint matches; the
   * effect below swaps in the visitor's real data once hydration has settled.
   */
  const [shopState, setShopState] = useState(getServerDefaultShopAccountState);
  const [activeSidebarId, setActiveSidebarId] = useState(() =>
    sidebarIdFromPathname(location.pathname),
  );
  const [shopInnerTab, setShopInnerTab] = useState(SHOP_INNER_TABS.DATA);
  const [notificationsPageTab, setNotificationsPageTab] = useState(
    SHOP_NOTIFICATIONS_PAGE_TABS.FEED,
  );
  const [isShopEditMode, setIsShopEditMode] = useState(false);
  const [profileDraft, setProfileDraft] = useState(() => emptyProfileDraft());
  const [status, setStatus] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productDraft, setProductDraft] = useState(() => emptyProductDraft());
  /**
   * A rejected field is reported next to the form that rejected it, not in the page-level
   * toast: "choose a category" floating above a form the seller has scrolled past is a message
   * about nothing they can see.
   */
  const [formErrorKey, setFormErrorKey] = useState("");
  const [profileErrorKey, setProfileErrorKey] = useState("");
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [justRefreshedIds, setJustRefreshedIds] = useState(() => new Set());
  /** The listings a confirmation dialog is currently asking about. Empty = no dialog. */
  const [pendingDeleteIds, setPendingDeleteIds] = useState([]);

  const statusTimerRef = useRef(0);
  const refreshTimersRef = useRef(new Map());

  const dismissStatus = useCallback(() => {
    window.clearTimeout(statusTimerRef.current);
    setStatus(null);
  }, []);

  /**
   * Success and information disappear on their own — a seller refreshing twelve listings does
   * not want to dismiss twelve panels. Errors stay until read, because the thing they report
   * has not been fixed by time passing.
   */
  const announce = useCallback((key, tone = SHOP_STATUS_TONES.SUCCESS, values = null) => {
    window.clearTimeout(statusTimerRef.current);
    setStatus({ key, tone, values });
    if (tone !== SHOP_STATUS_TONES.ERROR) {
      statusTimerRef.current = window.setTimeout(() => setStatus(null), STATUS_AUTO_DISMISS_MS);
    }
  }, []);

  useEffect(
    () => () => {
      window.clearTimeout(statusTimerRef.current);
      refreshTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
      refreshTimersRef.current.clear();
    },
    [],
  );

  const persist = useCallback((updater) => {
    const saved = writeShopAccountState(updater);
    setShopState(saved);
    return saved;
  }, []);

  useEffect(() => {
    setActiveSidebarId(sidebarIdFromPathname(location.pathname));
  }, [location.pathname]);

  useEffect(() => {
    setNotificationsPageTab(SHOP_NOTIFICATIONS_PAGE_TABS.FEED);
  }, [activeSidebarId]);

  useEffect(() => {
    const sync = () => setShopState(readShopAccountState());
    sync(); // populate the visitor's real data now that hydration has settled
    window.addEventListener(SHOP_ACCOUNT_STORAGE_EVENT, sync);
    return () => window.removeEventListener(SHOP_ACCOUNT_STORAGE_EVENT, sync);
  }, []);

  /**
   * A write that never reached storage is a change the seller will lose without being told.
   * The model refuses to throw from there (a `FileReader` callback has nothing to catch it), so
   * it announces instead and this turns the announcement into a visible error.
   */
  useEffect(() => {
    const onPersistError = () =>
      announce("shopAccount.messages.saveFailed", SHOP_STATUS_TONES.ERROR);
    window.addEventListener(SHOP_ACCOUNT_PERSIST_ERROR_EVENT, onPersistError);
    return () => window.removeEventListener(SHOP_ACCOUNT_PERSIST_ERROR_EVENT, onPersistError);
  }, [announce]);

  useEffect(() => {
    if (activeSidebarId !== SHOP_SIDEBAR_IDS.PRODUCTS) return undefined;

    const pruneExpired = () => {
      let removed = 0;
      persist((state) => {
        const pruned = pruneStaleShopProducts(state.shopProducts);
        if (pruned.length === state.shopProducts.length) return state;
        removed = state.shopProducts.length - pruned.length;
        return { ...state, shopProducts: pruned };
      });
      if (removed > 0) {
        announce("shopAccount.products.messages.autoRemoved", SHOP_STATUS_TONES.INFO, {
          count: removed,
        });
      }
    };

    pruneExpired();
    const intervalId = window.setInterval(pruneExpired, 60 * 60 * 1000);
    return () => window.clearInterval(intervalId);
  }, [activeSidebarId, persist, announce]);

  const selectSidebar = useCallback(
    (id) => {
      setActiveSidebarId(id);
      dismissStatus();
      setIsShopEditMode(false);
      setProfileDraft(emptyProfileDraft());
      setProfileErrorKey("");
      setShopInnerTab(SHOP_INNER_TABS.DATA);
      setShowProductForm(false);
      setEditingProductId(null);
      setProductDraft(emptyProductDraft());
      setFormErrorKey("");
      const path = SHOP_ACCOUNT_PATH_BY_SIDEBAR[id] || "/account/shop-account";
      navigate(path);
    },
    [navigate, dismissStatus],
  );

  const selectShopInnerTab = useCallback(
    (tabId) => {
      setShopInnerTab(tabId);
      dismissStatus();
      if (tabId !== SHOP_INNER_TABS.DATA) {
        setIsShopEditMode(false);
        setProfileDraft(emptyProfileDraft());
        setProfileErrorKey("");
      }
    },
    [dismissStatus],
  );

  const enterShopEdit = useCallback(() => {
    setProfileDraft({ ...readShopAccountState().profile });
    setIsShopEditMode(true);
    setProfileErrorKey("");
    dismissStatus();
  }, [dismissStatus]);

  const exitShopEdit = useCallback(() => {
    setIsShopEditMode(false);
    setProfileErrorKey("");
    setProfileDraft({ ...readShopAccountState().profile });
  }, []);

  const updateProfileDraft = useCallback((event) => {
    const { name, value } = event.target;
    setProfileDraft((prev) => ({ ...prev, [name]: value }));
  }, []);

  const updateDescriptionDraft = useCallback((value) => {
    setProfileDraft((prev) => ({ ...prev, description: value }));
  }, []);

  const updatePhoneLocal = useCallback((value) => {
    setProfileDraft((prev) => ({
      ...prev,
      phoneLocal: value.replace(/\D/g, "").slice(0, 8),
    }));
  }, []);

  const saveShopProfile = useCallback(
    (event) => {
      event.preventDefault();
      const shopName = profileDraft.shopName.trim();
      const email = profileDraft.email.trim();
      if (!shopName || !email) {
        setProfileErrorKey("shopAccount.messages.profileRequired");
        return;
      }
      setProfileErrorKey("");
      persist((state) => ({
        ...state,
        profile: {
          ...state.profile,
          shopName,
          description: profileDraft.description.trim(),
          email,
          phoneLocal: profileDraft.phoneLocal.replace(/\D/g, "").slice(0, 8),
          website: profileDraft.website.trim(),
        },
      }));
      announce("shopAccount.messages.profileSaved");
      setIsShopEditMode(false);
    },
    [persist, profileDraft, announce],
  );

  const setAvatarFromFile = useCallback(
    (file) => {
      if (!file || !file.type.startsWith("image/")) {
        announce("shopAccount.messages.avatarNotAnImage", SHOP_STATUS_TONES.ERROR);
        return;
      }
      if (file.size > 200 * 1024) {
        announce("shopAccount.messages.avatarTooLarge", SHOP_STATUS_TONES.ERROR);
        return;
      }
      /** The one genuinely asynchronous step in this dashboard, so it is the one with a spinner. */
      setIsAvatarUploading(true);
      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === "string" ? reader.result : "";
        persist((state) => ({ ...state, avatarDataUrl: result }));
        setIsAvatarUploading(false);
        announce("shopAccount.messages.avatarSaved");
      };
      reader.onerror = () => {
        setIsAvatarUploading(false);
        announce("shopAccount.messages.avatarFailed", SHOP_STATUS_TONES.ERROR);
      };
      reader.readAsDataURL(file);
    },
    [persist, announce],
  );

  const clearAvatar = useCallback(() => {
    persist((state) => ({ ...state, avatarDataUrl: "" }));
    announce("shopAccount.messages.avatarRemoved");
  }, [persist, announce]);

  const toggleShopNotification = useCallback(
    (key) => {
      persist((state) => ({
        ...state,
        notificationPrefs: {
          ...state.notificationPrefs,
          [key]: !state.notificationPrefs[key],
        },
      }));
      announce("shopAccount.messages.notificationsSaved");
    },
    [persist, announce],
  );

  const formattedPhone = useMemo(() => {
    const digits = shopState.profile.phoneLocal.replace(/\D/g, "");
    if (!digits) return "—";
    const parts = [
      digits.slice(0, 2),
      digits.slice(2, 4),
      digits.slice(4, 6),
      digits.slice(6, 8),
    ].filter(Boolean);
    return `+374 ${parts.join(" ")}`;
  }, [shopState.profile.phoneLocal]);

  const displayWebsiteHref = useMemo(() => {
    const w = shopState.profile.website.trim();
    if (!w) return "";
    if (/^https?:\/\//i.test(w)) return w;
    return `https://${w}`;
  }, [shopState.profile.website]);

  const updateProductPrice = useCallback((event) => {
    setProductDraft((prev) => ({ ...prev, price: event.target.value }));
  }, []);

  const selectProductCategory = useCallback((categoryId) => {
    setProductDraft((prev) => ({
      ...prev,
      categoryId,
      catalogProductId: "",
      selectedMemoryIds: [],
      selectedColorIds: [],
    }));
  }, []);

  const selectCatalogProduct = useCallback((catalogProductId) => {
    setProductDraft((prev) => ({ ...prev, catalogProductId }));
  }, []);

  const setProductAvailability = useCallback((availability) => {
    const next = availability === "out_of_stock" ? "out_of_stock" : "in_stock";
    setProductDraft((prev) => ({ ...prev, availability: next }));
  }, []);

  const toggleProductMemory = useCallback((memoryId) => {
    setProductDraft((prev) => {
      const selected = prev.selectedMemoryIds.includes(memoryId)
        ? prev.selectedMemoryIds.filter((id) => id !== memoryId)
        : [...prev.selectedMemoryIds, memoryId];
      return { ...prev, selectedMemoryIds: selected };
    });
  }, []);

  const toggleProductColor = useCallback((colorId) => {
    setProductDraft((prev) => {
      const selected = prev.selectedColorIds.includes(colorId)
        ? prev.selectedColorIds.filter((id) => id !== colorId)
        : [...prev.selectedColorIds, colorId];
      return { ...prev, selectedColorIds: selected };
    });
  }, []);

  const openProductForm = useCallback(() => {
    setEditingProductId(null);
    setProductDraft(emptyProductDraft());
    setFormErrorKey("");
    setShowProductForm(true);
    dismissStatus();
  }, [dismissStatus]);

  const openProductEdit = useCallback(
    (productId) => {
      const product = shopState.shopProducts.find((entry) => entry.id === productId);
      if (!product) return;
      setEditingProductId(productId);
      setProductDraft(productToDraft(product, t));
      setFormErrorKey("");
      setShowProductForm(true);
      dismissStatus();
    },
    [shopState.shopProducts, t, dismissStatus],
  );

  const cancelProductForm = useCallback(() => {
    setShowProductForm(false);
    setEditingProductId(null);
    setProductDraft(emptyProductDraft());
    setFormErrorKey("");
  }, []);

  const catalogProductsForDraft = useMemo(
    () => getCatalogProductsByCategory(productDraft.categoryId),
    [productDraft.categoryId],
  );

  const selectedCatalogProduct = useMemo(
    () => getCatalogProductById(productDraft.catalogProductId),
    [productDraft.catalogProductId],
  );

  const submitProductForm = useCallback(
    (event) => {
      event.preventDefault();
      const price = productDraft.price.trim();
      if (!productDraft.categoryId) {
        setFormErrorKey("shopAccount.products.messages.categoryRequired");
        return;
      }
      if (!productDraft.catalogProductId) {
        setFormErrorKey("shopAccount.products.messages.productRequired");
        return;
      }
      const catalogProduct = getCatalogProductById(productDraft.catalogProductId);
      if (!catalogProduct) {
        setFormErrorKey("shopAccount.products.messages.productRequired");
        return;
      }
      /**
       * Validate the *formatted* price (digits only), not the raw typed string — a
       * non-numeric price like "abc" is truthy before formatting but strips down to "",
       * which used to sail past this check and get saved as a blank price. Mirrors the
       * check already done correctly in updateShopProductPrice below.
       */
      const { price: formattedPrice, priceAmd } = formatShopPrice(price);
      if (!formattedPrice) {
        setFormErrorKey("shopAccount.products.messages.priceRequired");
        return;
      }
      const variants = productDraft.selectedMemoryIds
        .map((memoryId) => {
          const option = SHOP_MEMORY_OPTIONS.find((entry) => entry.id === memoryId);
          return resolveShopMemoryLabel(option, t);
        })
        .filter(Boolean);
      if (variants.length === 0) {
        setFormErrorKey("shopAccount.products.messages.memoryRequired");
        return;
      }
      const colorPayload = productDraft.selectedColorIds
        .map((colorId) => {
          const option = getShopColorOptionById(colorId);
          if (!option?.hex) return null;
          return { id: option.id, hex: option.hex };
        })
        .filter(Boolean);
      if (colorPayload.length === 0) {
        setFormErrorKey("shopAccount.products.messages.colorsRequired");
        return;
      }
      setFormErrorKey("");
      const availability =
        productDraft.availability === "out_of_stock" ? "out_of_stock" : "in_stock";
      const now = Date.now();
      const productPayload = {
        title: catalogProduct.title,
        description: catalogProduct.description,
        price: formattedPrice,
        priceAmd,
        category: t(getShopCategoryLabelKey(productDraft.categoryId)),
        categoryId: productDraft.categoryId,
        image: catalogProduct.image,
        availability,
        variants,
        colors: colorPayload,
      };

      if (editingProductId) {
        persist((state) => ({
          ...state,
          shopProducts: state.shopProducts.map((entry) =>
            entry.id === editingProductId
              ? normalizeShopProduct({
                  ...entry,
                  ...productPayload,
                  lastRefreshedAt: entry.lastRefreshedAt ?? now,
                })
              : entry,
          ),
        }));
        announce("shopAccount.products.messages.productUpdated");
      } else {
        persist((state) => ({
          ...state,
          shopProducts: [
            ...state.shopProducts,
            normalizeShopProduct({
              id: newShopProductId(),
              ...productPayload,
              createdAt: now,
              lastRefreshedAt: now,
            }),
          ],
        }));
        announce("shopAccount.products.messages.productAdded");
      }

      setShowProductForm(false);
      setEditingProductId(null);
      setProductDraft(emptyProductDraft());
    },
    [editingProductId, persist, productDraft, t, announce],
  );

  /**
   * Marks a row as "just refreshed" for a couple of seconds and, while that lasts, refuses to
   * refresh it again. The write itself is synchronous, so there is no progress to report and
   * none is faked (§22): what the seller gets is an acknowledgement that it happened, on the
   * row it happened to, plus a control that cannot be double-fired by an impatient second click.
   */
  const acknowledgeRefresh = useCallback((productIds) => {
    setJustRefreshedIds((prev) => new Set([...prev, ...productIds]));
    productIds.forEach((productId) => {
      window.clearTimeout(refreshTimersRef.current.get(productId));
      const timerId = window.setTimeout(() => {
        refreshTimersRef.current.delete(productId);
        setJustRefreshedIds((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      }, REFRESH_ACK_MS);
      refreshTimersRef.current.set(productId, timerId);
    });
  }, []);

  const refreshShopProducts = useCallback(
    (productIds) => {
      const ids = new Set(productIds);
      if (ids.size === 0) return;
      const now = Date.now();
      persist((state) => ({
        ...state,
        shopProducts: state.shopProducts.map((entry) =>
          ids.has(entry.id) ? normalizeShopProduct({ ...entry, lastRefreshedAt: now }) : entry,
        ),
      }));
      acknowledgeRefresh([...ids]);
      announce(
        ids.size === 1
          ? "shopAccount.products.messages.productRefreshed"
          : "shopAccount.products.messages.productsRefreshed",
        SHOP_STATUS_TONES.SUCCESS,
        { count: ids.size },
      );
    },
    [persist, announce, acknowledgeRefresh],
  );

  const refreshShopProduct = useCallback(
    (productId) => refreshShopProducts([productId]),
    [refreshShopProducts],
  );

  const updateShopProductPrice = useCallback(
    (productId, rawPrice) => {
      const { price, priceAmd } = formatShopPrice(rawPrice);
      if (!price) {
        announce("shopAccount.products.messages.priceRequired", SHOP_STATUS_TONES.ERROR);
        return false;
      }
      persist((state) => ({
        ...state,
        shopProducts: state.shopProducts.map((entry) =>
          entry.id === productId ? normalizeShopProduct({ ...entry, price, priceAmd }) : entry,
        ),
      }));
      announce("shopAccount.products.messages.priceUpdated");
      return true;
    },
    [persist, announce],
  );

  /** Deletion always goes through the dialog — nothing here removes a listing on one click. */
  const requestDeleteProducts = useCallback((productIds) => {
    const ids = productIds.filter(Boolean);
    if (ids.length > 0) setPendingDeleteIds(ids);
  }, []);

  const cancelDeleteProducts = useCallback(() => setPendingDeleteIds([]), []);

  const confirmDeleteProducts = useCallback(() => {
    const ids = new Set(pendingDeleteIds);
    if (ids.size === 0) return;
    persist((state) => ({
      ...state,
      shopProducts: state.shopProducts.filter((product) => !ids.has(product.id)),
    }));
    setPendingDeleteIds([]);
    announce(
      ids.size === 1
        ? "shopAccount.products.messages.productRemoved"
        : "shopAccount.products.messages.productsRemoved",
      SHOP_STATUS_TONES.SUCCESS,
      { count: ids.size },
    );
  }, [pendingDeleteIds, persist, announce]);

  const pendingDeleteProducts = useMemo(
    () => shopState.shopProducts.filter((product) => pendingDeleteIds.includes(product.id)),
    [shopState.shopProducts, pendingDeleteIds],
  );

  return {
    t,
    shopState,
    shopProducts: shopState.shopProducts,
    activeSidebarId,
    shopInnerTab,
    notificationsPageTab,
    setNotificationsPageTab,
    isShopEditMode,
    profileDraft,
    profileErrorKey,
    status,
    dismissStatus,
    sidebarIds: SHOP_SIDEBAR_IDS,
    innerTabs: SHOP_INNER_TABS,
    notificationsTabs: SHOP_NOTIFICATIONS_PAGE_TABS,
    selectSidebar,
    selectShopInnerTab,
    enterShopEdit,
    exitShopEdit,
    cancelShopEdit: exitShopEdit,
    updateProfileDraft,
    updateDescriptionDraft,
    updatePhoneLocal,
    saveShopProfile,
    setAvatarFromFile,
    isAvatarUploading,
    clearAvatar,
    toggleShopNotification,
    formattedPhone,
    displayWebsiteHref,
    showProductForm,
    editingProductId,
    productDraft,
    formErrorKey,
    catalogProductsForDraft,
    selectedCatalogProduct,
    openProductForm,
    openProductEdit,
    cancelProductForm,
    submitProductForm,
    updateProductPrice,
    selectProductCategory,
    selectCatalogProduct,
    refreshShopProduct,
    refreshShopProducts,
    justRefreshedIds,
    updateShopProductPrice,
    requestDeleteProducts,
    cancelDeleteProducts,
    confirmDeleteProducts,
    pendingDeleteProducts,
    setProductAvailability,
    toggleProductMemory,
    toggleProductColor,
  };
};

export default useShopAccountPresenter;
