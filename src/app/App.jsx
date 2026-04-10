import { HomePage } from "pages/home";
import { LanguageProvider } from "contexts";

const App = () => (
  <LanguageProvider>
    <HomePage />
  </LanguageProvider>
);

export default App;
