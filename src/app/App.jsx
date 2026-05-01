import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AccountPage } from "pages/account";
import { HomePage } from "pages/home";
import { FilterProduct } from "pages/filterproduct";
import { LanguageProvider } from "contexts";
import { SingleProduct } from "pages/singleproduct";

const UnknownRoute = () => (
  <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 px-4 font-sans text-center text-text-dark">
    <p className="text-lg">No page at this address.</p>
    <p className="text-text-muted">
      <Link className="text-link-blue underline" to="/">
        Home
      </Link>
      <span aria-hidden="true"> · </span>
      <Link className="text-link-blue underline" to="/singleproduct">
        Single product
      </Link>
      <span aria-hidden="true"> · </span>
      <Link className="text-link-blue underline" to="/filter">
        Filter catalog
      </Link>
    </p>
  </div>
);
const App = () => (
  <LanguageProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/singleproduct" element={<SingleProduct />} />
        <Route path="/filter" element={<FilterProduct />} />
        <Route path="/login" element={<AccountPage />} />
        <Route path="*" element={<UnknownRoute />} />
      </Routes>
    </BrowserRouter>
  </LanguageProvider>
);

export default App;
