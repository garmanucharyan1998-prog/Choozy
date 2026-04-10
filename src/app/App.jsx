import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "contexts";
import AppLayout from "./AppLayout";
import { HomePage } from "pages/home";
import { AboutPage } from "pages/about";
import { CatalogPage } from "pages/catalog";
import { ComparePage } from "pages/compare";
import { FavoritesPage } from "pages/favorites";
import { LoginPage } from "pages/login";
import { PrivacyPolicyPage } from "pages/privacy-policy";
import { TermsOfServicePage } from "pages/terms-of-service";
import { ProductsPage } from "pages/products";
import { VarietyPage } from "pages/variety";
import { NotFoundPage } from "pages/not-found";

const App = () => (
  <LanguageProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route element={<AppLayout />}>
          <Route path="/about" element={<AboutPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-of-service" element={<TermsOfServicePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/variety" element={<VarietyPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </LanguageProvider>
);

export default App;
