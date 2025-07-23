import "./App.scss";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RecipeDetailsPage from "./pages/RecipeDetailsPage";
import { useEffect } from "react";
import { useRecipeStore } from "./stores/useRecipeStore";
import axios from "axios";

function App() {
  useEffect(() => {
    axios
      .get("http://localhost:3000/recipes/favorites")
      .then((response) => {
        const favorites = response.data;
        useRecipeStore.getState().hydrateFavoritesFromDB(favorites);
      })
      .catch((error) => {
        console.error("Error fetching favorites:", error);
      });
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/details/:id" element={<RecipeDetailsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
