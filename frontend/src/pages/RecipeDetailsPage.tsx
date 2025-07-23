import "./RecipeDetailsPage.scss";
import empty from "../assets/empty.png";
import Icon from "@mdi/react";
import { mdiHeart, mdiHeartOutline } from "@mdi/js";
import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import { type Recipe, useRecipeStore } from "../stores/useRecipeStore";
import { useNavigate } from "react-router-dom";

const RecipeDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const favoriteRecipes = useRecipeStore((state) => state.favoriteRecipes);
  const generatedRecipes = useRecipeStore((state) => state.generatedRecipes);

  const recipe: Recipe | null = useMemo(() => {
    return (
      favoriteRecipes.find((r) => r.id === id) ||
      generatedRecipes.find((r) => r.id === id) ||
      null
    );
  }, [favoriteRecipes, generatedRecipes, id]);

  useEffect(() => {
    const loadMissingDetails = async () => {
      if (
        !recipe ||
        (recipe.ingredients?.length && recipe.instructions?.length)
      ) {
        setLoading(false);
        return;
      }

      try {
        const aiResponse = await axios.post<{ recipy: any }>(
          "http://localhost:3000/ai/complete",
          {
            name: recipe.name,
            duration: recipe.duration,
          }
        );

        const ingredients = aiResponse.data.recipy.ingredients;
        const instructions = aiResponse.data.recipy.instructions;

        useRecipeStore
          .getState()
          .completeRecipe(id || "", ingredients, instructions);
      } catch (err) {
        console.error("Failed to generate full recipe:", err);
      } finally {
        setLoading(false);
      }
    };

    loadMissingDetails();
  }, []);

  if (!loading && !recipe) {
    return <div className="recipe">Recipe not found.</div>;
  }
  if (recipe) {
    return (
      <div className="recipe">
        <div className="recipe__img-desc">
          {loading ? (
            <Skeleton height={400} width={400} />
          ) : (
            <img src={empty} alt={recipe?.name} />
          )}

          <div className="description">
            <div className="name-duration">
              <span className="name">{recipe.name || ""}</span>
              <span className="duration">{recipe.duration || ""}</span>
            </div>
            <div
              className="favorite"
              onClick={async () => {
                const newId = await useRecipeStore
                  .getState()
                  .toggleFavorite(recipe.id, recipe.favorite);

                if (newId && newId !== recipe.id) {
                  navigate(`/details/${newId}`, { replace: true });
                }
              }}
            >
              {loading ? (
                <Skeleton circle width={24} height={24} />
              ) : (
                <Icon
                  path={recipe?.favorite ? mdiHeart : mdiHeartOutline}
                  size={1}
                />
              )}
            </div>
          </div>
        </div>

        <div className="recipe__details">
          <div className="ingredients">
            <span className="ingredients__title">Ingredients:</span>
            <div className="ingredients__list">
              {loading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton
                      key={index}
                      width={`${30 + Math.random() * 40}%`}
                      height={23}
                      style={{ marginBottom: 6 }}
                    />
                  ))
                : recipe
                ? recipe.ingredients.map((ingredient, index) => (
                    <span className="list-item" key={index}>
                      {ingredient}
                    </span>
                  ))
                : null}
            </div>
          </div>

          <div className="instructions">
            <span className="instructions__title">Instructions:</span>
            <ol className="instructions__list">
              {loading
                ? Array.from({ length: 4 }).map((_, index) => (
                    <span key={index}>
                      <Skeleton
                        width={`${80 + Math.random() * 20}%`}
                        height={23}
                        style={{ transform: "translateX(-30px)" }}
                      />
                    </span>
                  ))
                : recipe?.instructions.map((step, index) => (
                    <li className="list-item" key={index}>
                      {step}
                    </li>
                  ))}
            </ol>
          </div>
        </div>
      </div>
    );
  }
};

export default RecipeDetailsPage;
