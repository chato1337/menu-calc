import { Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "./components/AppLayout";
import { AgeGroupsPage } from "./pages/AgeGroupsPage";
import { DaysPage } from "./pages/DaysPage";
import { OrdersPage } from "./pages/OrdersPage";
import { ProductQuantitiesPage } from "./pages/ProductQuantitiesPage";
import { ProductsPage } from "./pages/ProductsPage";
import { RecipesPage } from "./pages/RecipesPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/products" replace />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/age-groups" element={<AgeGroupsPage />} />
        <Route path="/product-quantities" element={<ProductQuantitiesPage />} />
        <Route path="/recipes" element={<RecipesPage />} />
        <Route path="/days" element={<DaysPage />} />
        <Route path="/orders" element={<OrdersPage />} />
      </Route>
    </Routes>
  );
}
