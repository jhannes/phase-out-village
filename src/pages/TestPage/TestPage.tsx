import React from "react";
import BadgeCard from "../../components/ui/cards/BadgeCard/BadgeCard";
import badgeCardImages from "../../assets/badgeCardImages";
import "./TestPage.css";

type BadgeCardProps = {
  image: string;
  title: string;
  description?: string;
};

const badgeData = [
  {
    image: badgeCardImages[0],
    title: "Explorer",
    description: "Awarded for discovering new areas.",
  },
  {
    image: badgeCardImages[1],
    title: "Champion",
    description: "Awarded for winning a tournament.",
  },
  {
    image: badgeCardImages[2],
    title: "Collector",
    description: "Awarded for collecting all items.",
  },
  {
    image: badgeCardImages[3],
    title: "Veteran",
    description: "Awarded for playing 100 games.",
  },
  {
    image: badgeCardImages[4],
    title: "Explorer",
    description: "Awarded for discovering new areas.",
  },
  {
    image: badgeCardImages[5],
    title: "Champion",
    description: "Awarded for winning a tournament.",
  },
  {
    image: badgeCardImages[6],
    title: "Collector",
    description: "Awarded for collecting all items.",
  },
  {
    image: badgeCardImages[7],
    title: "Veteran",
    description: "Awarded for playing 100 games.",
  },
] satisfies BadgeCardProps[];

const TestPage = () => {
  return (
    <div className="container">
      {badgeData.map((badge, idx) => (
        <BadgeCard
          key={idx}
          image={badge.image}
          title={badge.title}
          description={badge.description}
        />
      ))}
    </div>
  );
};

export default TestPage;
