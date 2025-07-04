import React from "react";

import "./BadgeCard.css";

interface BadgeCardProps {
  image: string;
  title: string;
  description?: string;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ title, description, image }) => {
  return (
    <div className="badge-card">
      <img src={image} alt={title} className="badge-image" />
      {/* <div className="badge-card-content"> */}
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {/* </div> */}
    </div>
  );
};

export default BadgeCard;
