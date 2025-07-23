import "./RecipeDetailsPage.scss";
import empty from "../assets/empty.png";
import Icon from "@mdi/react";
import { mdiHeart, mdiHeartOutline } from "@mdi/js";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export type Recipe = {
  id: number;
  name: string;
  duration: string;
  ingredients: string[];
  instructions: string[];
  favorite: boolean;
};

const RecipeDetailsPage: React.FC = () => {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  const location = useLocation();

  // Get passed state from Link
  const { name = "", duration = "", inDB = false } = location.state || {};

  useEffect(() => {
    const fetchRecipeFromDB = async () => {
      try {
        const response = await axios.get<Recipe>(
          `http://localhost:3000/recipes/${id}`
        );
        const data = response.data;
        setRecipe(data);
      } catch (err) {
        setError("Failed to fetch recipe from DB.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const generateAndSaveRecipe = async () => {
      try {
        // 1. Generate ingredients and instructions from AI
        const generationResponse = await axios.post(
          "http://localhost:3000/ai/generate",
          {
            name,
            duration,
            // You can pass more info here if needed
          }
        );

        const generatedRecipe = generationResponse.data; // { ingredients: string[], instructions: string[] }

        // 2. Save generated recipe to DB
        const saveResponse = await axios.post("http://localhost:3000/recipes", {
          name,
          duration,
          ingredients: JSON.stringify(generatedRecipe.ingredients),
          instructions: JSON.stringify(generatedRecipe.instructions),
          favorite: false,
        });

        const savedRecipe = saveResponse.data;

        setRecipe({
          id: savedRecipe.id,
          name,
          duration,
          favorite: false,
          ingredients: generatedRecipe.ingredients,
          instructions: generatedRecipe.instructions,
        });
      } catch (err) {
        setError("Failed to generate or save recipe.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);

    if (inDB) {
      fetchRecipeFromDB();
    } else {
      generateAndSaveRecipe();
    }
  }, [id, inDB, name, duration]);

  if (loading) {
    return <div className="loading">Loading recipe details...</div>;
  }

  if (!recipe) {
    return <div className="error">Recipe not found.</div>;
  }

  return (
    <div className="recipe">
      <div className="recipe__img-desc">
        <img src={empty} alt={recipe.name} />
        <div className="description">
          <div className="name-duration">
            <span className="name">{recipe.name}</span>
            <span className="duration">{recipe.duration}</span>
          </div>
          <div className="favorite">
            <Icon
              path={recipe.favorite ? mdiHeart : mdiHeartOutline}
              size={1}
            />
          </div>
        </div>
      </div>

      <div className="recipe__details">
        <div className="ingredients">
          <span className="ingredients__title">Ingredients:</span>
          <div className="ingredients__list">
            {recipe.ingredients.map((ingredient, index) => (
              <span className="list-item" key={index}>
                {ingredient}
              </span>
            ))}
          </div>
        </div>
        <div className="instructions">
          <span className="instructions__title">Instructions:</span>
          <ol className="ingredients__list">
            {recipe.instructions.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailsPage;
