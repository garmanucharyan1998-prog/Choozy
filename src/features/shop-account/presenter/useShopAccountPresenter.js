import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getCatalogProductById,
  getCatalogProductsByCategory,
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
  SHOP_ACCOUNT_STORAGE_EVENT,
  SHOP_INNER_TABS,
  SHOP_NOTIFICATIONS_PAGE_TABS,
  SHOP_SIDEBAR_IDS,
  writeShopAccountState,
} from "entities/shop";
import { useLanguage } from "contexts";

const SHOP_ACCOUNT_PATH_BY_SIDEBAR = {
  [SHOP_SIDEBAR_IDS.DETAILS]: "/account/shop-account",
  [SHOP_SIDEBAR_IDS.PRODUCTS]: "/account/shop-account/products",
  [SHOP_SIDEBAR_IDS.STATISTICS]: "/account/shop-account/statistics",
  [SHOP_SIDEBAR_IDS.FINANCE]: "/account/shop-account/finance",
};

const sidebarIdFromPathname = (pathname) => {
  const base = pathname.replace(/\/$/, "") || "/account/shop-account";
  if (base === "/account/shop-account/products") return SHOP_SIDEBAR_IDS.PRODUCTS;
  if (base === "/account/shop-account/statistics") return SHOP_SIDEBAR_IDS.STATISTICS;
  if (base === "/account/shop-account/finance") return SHOP_SIDEBAR_IDS.FINANCE;
  return SHOP_SIDEBAR_IDS.DETAILS;
};

const emptyProfileDraft = () => ({ ...readShopAccountState().profile });

const emptyProductDraft = () => ({
  categoryId: "",
  catalogProductId: "",
  price: "",
  availability: "in_stock",
  selectedMemoryIds: [],
  selectedColorIds: [],
});

const newShopProductId = () =>
  typeof window !== "undefined" &&
  typeof window.crypto !== "undefined" &&
  typeof window.crypto.randomUUID === "function"
    ? `shop-${window.crypto.randomUUID()}`
    : `shop-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const formatShopPrice = (raw) => {
  const digits = String(raw ?? "").replace(/[^\d]/g, "");
  if (!digits) return { price: "", priceAmd: undefined };
  const priceAmd = parseInt(digits, 10);
  return {
    price: Number.isFinite(priceAmd) ? priceAmd.toLocaleString("en-US") : "",
    priceAmd: Number.isFinite(priceAmd) ? priceAmd : undefined,
  };
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

  const price =
    typeof product.price === "string" && product.price.trim()
      ? product.price.replace(/[^\d]/g, "")
      : typeof product.priceAmd === "number" && Number.isFinite(product.priceAmd)
        ? String(product.priceAmd)
        : "";

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
  const navigate = useNavigate();

  const [shopState, setShopState] = useState(() => readShopAccountState());
  const [activeSidebarId, setActiveSidebarId] = useState(() => sidebarIdFromPathname(location.pathname));
  const [shopInnerTab, setShopInnerTab] = useState(SHOP_INNER_TABS.DATA);
  const [notificationsPageTab, setNotificationsPageTab] = useState(SHOP_NOTIFICATIONS_PAGE_TABS.FEED);
  const [isShopEditMode, setIsShopEditMode] = useState(false);
  const [profileDraft, setProfileDraft] = useState(() => emptyProfileDraft());
  const [statusKey, setStatusKey] = useState("");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productDraft, setProductDraft] = useState(() => emptyProductDraft());

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
    window.addEventListener(SHOP_ACCOUNT_STORAGE_EVENT, sync);
    return () => window.removeEventListener(SHOP_ACCOUNT_STORAGE_EVENT, sync);
  }, []);

  useEffect(() => {
    if (activeSidebarId !== SHOP_SIDEBAR_IDS.PRODUCTS) return undefined;

    const pruneExpired = () => {
      let removed = false;
      persist((state) => {
        const pruned = pruneStaleShopProducts(state.shopProducts);
        if (pruned.length === state.shopProducts.length) return state;
        removed = true;
        return { ...state, shopProducts: pruned };
      });
      if (removed) setStatusKey("shopAccount.products.messages.autoRemoved");
    };

    pruneExpired();
    const intervalId = window.setInterval(pruneExpired, 60 * 60 * 1000);
    return () => window.clearInterval(intervalId);
  }, [activeSidebarId, persist]);

  const selectSidebar = useCallback(
    (id) => {
      setActiveSidebarId(id);
      setStatusKey("");
      setIsShopEditMode(false);
      setProfileDraft(emptyProfileDraft());
      setShopInnerTab(SHOP_INNER_TABS.DATA);
      setShowProductForm(false);
      setEditingProductId(null);
      setProductDraft(emptyProductDraft());
      const path = SHOP_ACCOUNT_PATH_BY_SIDEBAR[id] || "/account/shop-account";
      navigate(path);
    },
    [navigate],
  );

  const selectShopInnerTab = useCallback((tabId) => {
    setShopInnerTab(tabId);
    setStatusKey("");
    if (tabId !== SHOP_INNER_TABS.DATA) {
      setIsShopEditMode(false);
      setProfileDraft(emptyProfileDraft());
    }
  }, []);

  const enterShopEdit = useCallback(() => {
    setProfileDraft({ ...readShopAccountState().profile });
    setIsShopEditMode(true);
    setStatusKey("");
  }, []);

  const exitShopEdit = useCallback(() => {
    setIsShopEditMode(false);
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
        setStatusKey("shopAccount.messages.profileRequired");
        return;
      }
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
      setStatusKey("shopAccount.messages.profileSaved");
      setIsShopEditMode(false);
    },
    [persist, profileDraft],
  );

  const setAvatarFromFile = useCallback(
    (file) => {
      if (!file || !file.type.startsWith("image/")) return;
      if (file.size > 200 * 1024) {
        setStatusKey("shopAccount.messages.avatarTooLarge");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === "string" ? reader.result : "";
        persist((state) => ({ ...state, avatarDataUrl: result }));
        setStatusKey("shopAccount.messages.avatarSaved");
      };
      reader.readAsDataURL(file);
    },
    [persist],
  );

  const clearAvatar = useCallback(() => {
    persist((state) => ({ ...state, avatarDataUrl: "" }));
    setStatusKey("shopAccount.messages.avatarRemoved");
  }, [persist]);

  const toggleShopNotification = useCallback(
    (key) => {
      persist((state) => ({
        ...state,
        notificationPrefs: {
          ...state.notificationPrefs,
          [key]: !state.notificationPrefs[key],
        },
      }));
      setStatusKey("shopAccount.messages.notificationsSaved");
    },
    [persist],
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
    setShowProductForm(true);
    setStatusKey("");
  }, []);

  const openProductEdit = useCallback(
    (productId) => {
      const product = shopState.shopProducts.find((entry) => entry.id === productId);
      if (!product) return;
      setEditingProductId(productId);
      setProductDraft(productToDraft(product, t));
      setShowProductForm(true);
      setStatusKey("");
    },
    [shopState.shopProducts, t],
  );

  const cancelProductForm = useCallback(() => {
    setShowProductForm(false);
    setEditingProductId(null);
    setProductDraft(emptyProductDraft());
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
        setStatusKey("shopAccount.products.messages.categoryRequired");
        return;
      }
      if (!productDraft.catalogProductId) {
        setStatusKey("shopAccount.products.messages.productRequired");
        return;
      }
      const catalogProduct = getCatalogProductById(productDraft.catalogProductId);
      if (!catalogProduct) {
        setStatusKey("shopAccount.products.messages.productRequired");
        return;
      }
      if (!price) {
        setStatusKey("shopAccount.products.messages.priceRequired");
        return;
      }
      const variants = productDraft.selectedMemoryIds
        .map((memoryId) => {
          const option = SHOP_MEMORY_OPTIONS.find((entry) => entry.id === memoryId);
          return resolveShopMemoryLabel(option, t);
        })
        .filter(Boolean);
      if (variants.length === 0) {
        setStatusKey("shopAccount.products.messages.memoryRequired");
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
        setStatusKey("shopAccount.products.messages.colorsRequired");
        return;
      }
      const availability =
        productDraft.availability === "out_of_stock" ? "out_of_stock" : "in_stock";
      const { price: formattedPrice, priceAmd } = formatShopPrice(price);
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
        setStatusKey("shopAccount.products.messages.productUpdated");
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
        setStatusKey("shopAccount.products.messages.productAdded");
      }

      setShowProductForm(false);
      setEditingProductId(null);
      setProductDraft(emptyProductDraft());
    },
    [editingProductId, persist, productDraft, t],
  );

  const refreshShopProduct = useCallback(
    (productId) => {
      const now = Date.now();
      persist((state) => ({
        ...state,
        shopProducts: state.shopProducts.map((entry) =>
          entry.id === productId
            ? normalizeShopProduct({ ...entry, lastRefreshedAt: now })
            : entry,
        ),
      }));
      setStatusKey("shopAccount.products.messages.productRefreshed");
    },
    [persist],
  );

  const updateShopProductPrice = useCallback(
    (productId, rawPrice) => {
      const { price, priceAmd } = formatShopPrice(rawPrice);
      if (!price) {
        setStatusKey("shopAccount.products.messages.priceRequired");
        return;
      }
      persist((state) => ({
        ...state,
        shopProducts: state.shopProducts.map((entry) =>
          entry.id === productId
            ? normalizeShopProduct({ ...entry, price, priceAmd })
            : entry,
        ),
      }));
      setStatusKey("shopAccount.products.messages.priceUpdated");
    },
    [persist],
  );

  const removeShopProduct = useCallback(
    (productId) => {
      persist((state) => ({
        ...state,
        shopProducts: state.shopProducts.filter((p) => p.id !== productId),
      }));
      setStatusKey("shopAccount.products.messages.productRemoved");
    },
    [persist],
  );

  const sortedShopProducts = useMemo(
    () => [...shopState.shopProducts].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)),
    [shopState.shopProducts],
  );

  const dismissStatus = useCallback(() => {
    setStatusKey("");
  }, []);

  return {
    t,
    shopState,
    activeSidebarId,
    shopInnerTab,
    notificationsPageTab,
    setNotificationsPageTab,
    isShopEditMode,
    profileDraft,
    statusKey,
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
    clearAvatar,
    toggleShopNotification,
    formattedPhone,
    displayWebsiteHref,
    showProductForm,
    editingProductId,
    productDraft,
    catalogProductsForDraft,
    selectedCatalogProduct,
    sortedShopProducts,
    openProductForm,
    openProductEdit,
    cancelProductForm,
    submitProductForm,
    updateProductPrice,
    selectProductCategory,
    selectCatalogProduct,
    refreshShopProduct,
    updateShopProductPrice,
    removeShopProduct,
    setProductAvailability,
    toggleProductMemory,
    toggleProductColor,
  };
};

export default useShopAccountPresenter;
