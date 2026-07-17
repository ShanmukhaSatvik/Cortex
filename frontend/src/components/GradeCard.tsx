import React from "react";
import ImageNavCard from "./ImageNavCard";

const gradeArt = require("../../assets/illustrations/grade-badge.png");

export default function GradeCard({
  name,
  level,
  accent,
  onPress,
}: {
  name: string;
  level: number;
  accent: string;
  onPress: () => void;
}) {
  return (
    <ImageNavCard
      title={name}
      subtitle="Tap to explore subjects"
      image={gradeArt}
      accent={accent}
      badge={level}
      onPress={onPress}
    />
  );
}
