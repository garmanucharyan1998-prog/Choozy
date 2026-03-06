# MVP Architecture

Choozy uses **Model-View-Presenter (MVP)** for separation of concerns.

## Structure

```
core/mvp/
├── model/
│   ├── productModel.js      # Product data (top products, variety)
│   ├── searchModel.js       # Search suggestions, search submit
│   ├── headerModel.js       # Languages config
│   ├── catalogModel.js      # Grid catalog items
│   ├── navModel.js          # Navigation items
│   └── servicesModel.js     # Services overview data
├── presenter/
│   ├── index.js             # Re-exports all presenters
│   ├── useTopProductsPresenter.js
│   ├── useVarietyPresenter.js
│   ├── useHeaderPresenter.js
│   ├── useNavPanelPresenter.js
│   ├── useGridCatalogPresenter.js
│   └── useServicesPresenter.js
└── view/                    # = components/ (thin UI components)
```

## Layers

### Model
- **Location:** `core/mvp/model/` (domain) + `features/api/` (data source)
- **Responsibility:** Data access, transformation, business rules
- **Rule:** No UI logic, no JSX, data only

### Presenter
- **Location:** `core/mvp/presenter/`
- **Implementation:** React hooks (`useXxxPresenter`)
- **Responsibility:** Load from Model, manage state, handle events, pass to View
- **Rule:** No JSX, logic and data for View only

### View
- **Location:** `components/`
- **Responsibility:** Render data and invoke callbacks from Presenter
- **Rule:** Presentational components, no direct API calls, no business logic

## Data Flow

```
User Action -> View (callback) -> Presenter -> Model (API)
                 ^                                |
                 +-------- state/props <----------+
```

## Coverage

| Component             | Model                    | Presenter                   | View                       |
|-----------------------|--------------------------|-----------------------------|----------------------------|
| Header                | headerModel, searchModel | useHeaderPresenter          | Header.jsx                 |
| NavPanel              | navModel                 | useNavPanelPresenter        | NavPanel.jsx               |
| GridCatalog           | catalogModel             | useGridCatalogPresenter     | GridCatalog.jsx            |
| TopProducts           | productModel             | useTopProductsPresenter     | TopProducts.jsx            |
| Variety               | productModel             | useVarietyPresenter         | Variety.jsx                |
| ServicesOverview      | servicesModel            | use ServicesPresenter       | ServicesOverview.jsx       |
| AboutUs               | (static)                 | (none)                      | AboutUs.jsx                |
| Footer                | (static)                 | (none)                      | Footer.js                  |
