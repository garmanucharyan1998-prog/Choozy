import Header from "./components/Header/Header";
import "./App.css";
import NavPanel from "./components/NavPanel/NavPanel";
import GridCatalog from "./components/sections/GridCatalog/GridCatalog";
import TopProducts from "./components/sections/TopProducts/TopProducts";
import AboutUs from "./components/sections/AboutUs/AboutUs";
import Variety from "./components/sections/Variety/Variety";
import ServicesOverview from "./components/sections/ServicesOverview/ServicesOverview";
import Footer from "./components/Footer/Footer";

function App() {
  return (
    <div className="App">
      <Header />
      <main>
        <NavPanel />
        <GridCatalog />
        <TopProducts />
        <AboutUs />
        <Variety />
        <ServicesOverview />
      </main>
      <Footer />
      <footer></footer>
    </div>
  );
}

export default App;
