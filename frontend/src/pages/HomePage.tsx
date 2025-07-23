import "./HomePage.scss";
import RecipeCard from "../components/RecipeCard";
import SearchIcon from "../components/icons/SearchIcon";
import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { mdiArrowLeft } from "@mdi/js";
import Icon from "@mdi/react";
import { v4 as uuidv4 } from "uuid";
import {
  type RecipeType,
  type Recipe,
  useRecipeStore,
} from "../stores/useRecipeStore";

export default function HomePage() {
  const favoriteRecipes: Recipe[] = useRecipeStore(
    (state) => state.favoriteRecipes
  );
  const generatedRecipes: Recipe[] = useRecipeStore(
    (state) => state.generatedRecipes
  );
  const recipeType: RecipeType = useRecipeStore((state) => state.recipeType);

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const recipes =
    recipeType === "favorites" ? favoriteRecipes : generatedRecipes;

  const sendPrompt = async (sendNegative: boolean = false) => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    useRecipeStore.getState().setRecipeType("generated");

    try {
      const response = await axios.post("http://localhost:3000/ai/chat", {
        prompt: searchTerm,
        negative: sendNegative ? JSON.stringify(generatedRecipes) : "",
      });

      const recipes = response.data.reply;

      if (!Array.isArray(recipes)) {
        throw new Error("Invalid format: 'recipes' should be an array.");
      }

      const recipesWithIds = recipes.map((r: Recipe) => ({
        ...r,
        id: uuidv4(),
        favorite: false,
      }));

      useRecipeStore.getState().setGeneratedRecipes(recipesWithIds);
    } catch (err) {
      console.error("Failed to parse AI response:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="homepage">
      <section>
        <div className="search-field">
          <input
            type="text"
            placeholder="What do you feel like eating?"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendPrompt();
            }}
          />
          <div onClick={() => sendPrompt()}>
            <SearchIcon size={16} />
          </div>
        </div>
      </section>

      <section className="recipes">
        <span className="recipes__title">
          {recipeType === "generated" ? (
            <span
              onClick={() => {
                useRecipeStore.getState().setRecipeType("favorites");
              }}
            >
              <Icon className="back-icon" path={mdiArrowLeft} size={1} />
            </span>
          ) : null}
          {recipeType === "favorites" ? "Favorites" : "Suggested recipes"}
        </span>
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <RecipeCard
              key={index}
              title={""}
              duration={""}
              isFavorite={false}
              onToggleFavorite={() => {}}
              isLoading={true}
            />
          ))
        ) : recipes.length ? (
          <>
            {recipes.map(({ id, name, duration, favorite }) => (
              <Link
                key={id}
                to={`/details/${id}`}
                style={{ textDecoration: "none", color: "inherit" }}
                state={{
                  id: id,
                  name: name,
                  duration: duration,
                  favorite: favorite,
                }}
              >
                <RecipeCard
                  title={name}
                  duration={duration}
                  isFavorite={favorite}
                  onToggleFavorite={(evt) => {
                    evt.preventDefault();
                    useRecipeStore.getState().toggleFavorite(id, favorite);
                  }}
                  isLoading={false}
                />
              </Link>
            ))}
            <div className="dont-like">
              <button onClick={() => sendPrompt(true)}>I dont like these</button>
            </div>
          </>
        ) : (
          <p className="no-recipes">
            {recipeType === "favorites"
              ? "No favorite recipes yet."
              : "No suggested recipes yet."}
          </p>
        )}
      </section>
    </div>
  );
}
