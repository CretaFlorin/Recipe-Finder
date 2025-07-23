// store/useRecipeStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

export type Recipe = {
  id: string;
  name: string;
  duration: string;
  ingredients: string[];
  instructions: string[];
  favorite: boolean;
};

export type RecipeType = "favorites" | "generated";

type RecipeStore = {
  generatedRecipes: Recipe[];
  favoriteRecipes: Recipe[];
  recipeType: RecipeType;
  addGenerated: (r: Recipe) => void;
  setGeneratedRecipes: (recipes: Recipe[]) => void;
  setRecipeType: (rType: RecipeType) => void;
  toggleFavorite: (id: string, currentFav: boolean) => Promise<string | undefined>;
  removeGenerated: (id: string) => void;
  hydrateFavoritesFromDB: (recipes: Recipe[]) => void;
  completeRecipe: (
    id: string,
    ingredients: string[],
    instructions: string[]
  ) => void;
};

export const useRecipeStore = create<RecipeStore>()(
  persist(
    (set, get) => ({
      generatedRecipes: [],
      favoriteRecipes: [],
      recipeType: "favorites" as RecipeType,

      addGenerated: (r) => {
        set({
          generatedRecipes: [...get().generatedRecipes, r],
        });
      },

      removeGenerated: (id) => {
        set({
          generatedRecipes: get().generatedRecipes.filter((r) => r.id !== id),
        });
      },

      setGeneratedRecipes: (recipes: Recipe[]) => {
        set({ generatedRecipes: recipes });
      },

      setRecipeType: (rType: RecipeType) => {
        set({ recipeType: rType });
      },

      toggleFavorite: async (id: string, currentFav: boolean) => {
        const state = get();

        const inDB = state.favoriteRecipes.some((r) => r.id === id);
        const recipeInGenerated = state.generatedRecipes.find(
          (r) => r.id === id
        );

        const updatedGenerated = state.generatedRecipes.map((r) =>
          r.id === id ? { ...r, favorite: !currentFav } : r
        );

        const updatedFavorites = state.favoriteRecipes.map((r) =>
          r.id === id ? { ...r, favorite: !currentFav } : r
        );

        set({
          generatedRecipes: updatedGenerated,
          favoriteRecipes: updatedFavorites,
        });

        // If the recipe was in DB we need to also update it
        if (inDB) {
          try {
            await axios.patch(`http://localhost:3000/recipes/${id}/favorite`, {
              favorite: !currentFav,
            });
          } catch (err) {
            // Rollback local state if API call fails
            set({
              generatedRecipes: state.generatedRecipes,
              favoriteRecipes: state.favoriteRecipes,
            });
            console.error("Failed to update favorite in DB:", err);
          }
        } else if (!inDB && !currentFav && recipeInGenerated) {
          try {
            const { id, ...recipeData } = recipeInGenerated;

            const response = await axios.post("http://localhost:3000/recipes", {
              ...recipeData,
              favorite: !currentFav,
              ingredients: recipeInGenerated?.ingredients || [],
              instructions: recipeInGenerated?.instructions || [],
            });

            const savedRecipe = {
              ...response.data,
              id: response.data.id.toString(),
              ingredients: JSON.parse(response.data.ingredients),
              instructions: JSON.parse(response.data.instructions),
            };

            const updatedGeneratedAfterSave = state.generatedRecipes.map((r) =>
              r.id === id ? { ...savedRecipe, favorite: true } : r
            );

            const updatedFavoritesAfterSave = [
              ...state.favoriteRecipes,
              { ...savedRecipe, favorite: true },
            ];

            set({
              generatedRecipes: updatedGeneratedAfterSave,
              favoriteRecipes: updatedFavoritesAfterSave,
            });

            return savedRecipe.id;

          } catch (err) {
            console.error("Failed to save new favorite recipe to DB:", err);
          }
        }
      },

      hydrateFavoritesFromDB: (recipes: any[]) => {
        set({
          favoriteRecipes: recipes.map((r) => {
            return {
              ...r,
              id: r.id.toString(),
              ingredients: JSON.parse(r.ingredients),
              instructions: JSON.parse(r.instructions),
            };
          }),
        });
      },

      completeRecipe: async (
        id: string,
        ingredients: string[],
        instructions: string[]
      ) => {
        const state = get();
        const favorite = state.favoriteRecipes.find((r: Recipe) => r.id === id);

        if (favorite) {
          try {
            await axios.patch(`http://localhost:3000/recipes/${id}/complete`, {
              ingredients,
              instructions,
            });
          } catch (err) {
            console.error("Failed to persist completed recipe:", err);
          }
        }

        set((state) => ({
          generatedRecipes: state.generatedRecipes.map((recipe) =>
            recipe.id === id
              ? {
                  ...recipe,
                  ingredients,
                  instructions,
                }
              : recipe
          ),
          favoriteRecipes: state.favoriteRecipes.map((recipe) =>
            recipe.id === id
              ? {
                  ...recipe,
                  ingredients,
                  instructions,
                }
              : recipe
          ),
        }));
      },
    }),
    {
      name: "recipe-store",
    }
  )
);
