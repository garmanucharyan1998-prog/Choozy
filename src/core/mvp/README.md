# MVP Architecture

Choozy uses **Model-View-Presenter (MVP)** for separation of concerns.

## Structure

```
core/mvp/
├── model/          # Data access, business entities
├── presenter/      # Presentation logic (hooks)
└── view/           # Reference: components/ — thin UI components
```

## Layers

### Model
- **Location:** `core/mvp/model/productModel.js` (domain model) + `features/api/` (data source)
- **Responsibility:** Load raw data via API/mocks, transform to view-ready format, resolve images
- **Rule:** No UI logic, data only

### Presenter
- **Location:** `core/mvp/presenter/`
- **Implementation:** React hooks (`useXxxPresenter`)
- **Responsibility:** Load from Model, manage state, handle events, pass to View
- **Rule:** No JSX, logic and data for View only

### View
- **Location:** `components/`
- **Responsibility:** Render data and invoke callbacks
- **Rule:** Presentational components, receive props from Presenter

## Data Flow

```
User Action → View (callback) → Presenter → Model (API)
                ↑                              │
                └────── state/props ←──────────┘
```

## Usage Example

```jsx
// View
const VarietyView = () => {
  const { items, loading, error } = useVarietyPresenter();
  return <VarietySection items={items} loading={loading} error={error} />;
};
```
