import "./HomePage.scss";
import RecipeCard from "../components/RecipeCard";
import SearchIcon from "../components/icons/SearchIcon";
import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export type Recipe = {
  id: number;
  name: string;
  duration: string;
  favorite: boolean;
  ingredients: string[];
  instructions: string[];
};

enum RecipeTypes {
  Favorites = "favorites",
  Generated = "generated",
}

export default function HomePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [recipeType, setRecipeType] = useState<RecipeTypes>(() => {
    const saved = localStorage.getItem("recipeType");
    return saved === RecipeTypes.Favorites || saved === RecipeTypes.Generated
      ? (saved as RecipeTypes)
      : RecipeTypes.Favorites;
  });

  useEffect(() => {
    if (recipeType === RecipeTypes.Favorites) {
      axios
        .get<Recipe[]>("http://localhost:3000/recipes")
        .then((response) => {
          const favorites = response.data;
          setRecipes(favorites);
        })
        .catch((error) => {
          console.error("Error fetching favorites:", error);
        });
    } else if (recipeType === RecipeTypes.Generated) {
      const generated = localStorage.getItem("generatedRecipes");
      console.log("---", generated);

      if (generated) {
        try {
          const parsed = JSON.parse(generated);
          setRecipes(parsed);
        } catch (error) {
          console.error(
            `Error parsing genenratedRecipes from localStorage:`,
            error
          );
        }
      } else {
        setRecipes([]);
      }
    }
  }, [recipeType]);

  const sendPrompt = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    goToGenerated();

    try {
      const response = await axios.post("http://localhost:3000/ai/chat", {
        prompt: searchTerm,
      });

      const recipes = response.data.reply;

      if (!Array.isArray(recipes)) {
        throw new Error("Invalid format: 'recipes' should be an array.");
      }

      localStorage.setItem("generatedRecipes", JSON.stringify(recipes));
      setRecipes(recipes);
    } catch (err) {
      console.error("Failed to parse AI response:", err);
    } finally {
      setLoading(false);
    }
  };

  const makeFavorite = async (id: number, currentFav: boolean) => {
    console.log("FAV:", id, currentFav);
    setRecipes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, favorite: !currentFav } : r))
    );

    try {
      await axios.patch(`http://localhost:3000/recipes/${id}/favorite`, {
        favorite: !currentFav,
      });
    } catch (err) {
      setRecipes((prev) =>
        prev.map((r) => (r.id === id ? { ...r, favorite: currentFav } : r))
      );
      console.error("Failed to update favorite:", err);
    }
  };

  const goToFavorites = () => {
    localStorage.setItem("recipeType", RecipeTypes.Favorites);
    setRecipeType(RecipeTypes.Favorites);
  };

  const goToGenerated = () => {
    localStorage.setItem("recipeType", RecipeTypes.Generated);
    console.log(localStorage.getItem("generatedRecipes"));
    setRecipeType(RecipeTypes.Generated);
  };

  return (
    <div className="homepage">
      <div className="view-toggle">
        <button onClick={goToFavorites}>View Favorites</button>
        <button onClick={goToGenerated}>View Suggested</button>
      </div>
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
          <div onClick={sendPrompt}>
            <SearchIcon size={16} />
          </div>
        </div>
      </section>

      <section className="recipes">
        <span className="recipes__title">
          {recipeType === RecipeTypes.Favorites
            ? "Favorites"
            : "Suggested recipes"}
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
          recipes.map(({ id, name, duration, favorite }) => (
            <Link
              key={id}
              to={`/recipes/${id}`}
              style={{ textDecoration: "none", color: "inherit" }}
              state={{
                name: name,
                duration: duration,
                favorite: favorite,
                inDB: recipeType === RecipeTypes.Favorites,
              }}
            >
              <RecipeCard
                title={name}
                duration={duration}
                isFavorite={favorite}
                onToggleFavorite={(evt) => {
                  evt.preventDefault();
                  makeFavorite(id, favorite);
                }}
                isLoading={false}
              />
            </Link>
          ))
        ) : (
          <p className="no-recipes">
            {recipeType === RecipeTypes.Favorites
              ? "No favorite recipes yet."
              : "No suggested recipes yet."}
          </p>
        )}
      </section>
    </div>
  );
}
