import React from "react";
import "./RecipeCard.scss";
import Icon from "@mdi/react";
import { mdiHeart } from "@mdi/js";
import { mdiHeartOutline } from "@mdi/js";
import empty from "../assets/empty.png";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

type RecipeCardProps = {
  title: string;
  duration: string;
  isFavorite: boolean;
  onToggleFavorite: (evt: any) => void;
  isLoading: boolean;
};

const RecipeCard: React.FC<RecipeCardProps> = ({
  title,
  duration,
  isFavorite,
  onToggleFavorite,
  isLoading = false,
}) => {
  return (
    <div className="recipe-card">
      <div className="recipe-card__image">
        {isLoading ? (
          <Skeleton
            className="recipe-img"
            height={72}
            width={72}
            borderRadius={12}
          />
        ) : (
          <img className="recipe-img" src={empty} />
        )}
      </div>
      <div className="recipe-card__content">
        <span className="recipe-card__content__title">
          {isLoading ? <Skeleton width={200} height={22} /> : title}
        </span>
        <span className="recipe-card__content__duration">
          {isLoading ? <Skeleton width={80} height={20} /> : duration}
        </span>
      </div>

      {!isLoading && (
        <div
          className={`recipe-card__favorite ${
            isFavorite ? "favorite--active" : ""
          }`}
          onClick={(evt: any) => onToggleFavorite(evt)}
        >
          <Icon path={isFavorite ? mdiHeart : mdiHeartOutline} size={1} />
        </div>
      )}
    </div>
  );
};

export default RecipeCard;
