import type { ComponentProps } from "react";
import type { ImageSourcePropType } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type IconName = ComponentProps<typeof Ionicons>["name"];

const mathArt = require("../../assets/illustrations/subject-math.png");
const scienceArt = require("../../assets/illustrations/subject-science.png");
const englishArt = require("../../assets/illustrations/subject-english.png");
/** New filenames so Metro/Expo do not keep serving cached old badges. */
const chapterArt = require("../../assets/illustrations/chapter-open.png");
const topicArt = require("../../assets/illustrations/topic-explore.png");

const SUBJECT_ICONS: Record<string, IconName> = {
  mathematics: "calculator-outline",
  math: "calculator-outline",
  science: "flask-outline",
  english: "book-outline",
  hindi: "language-outline",
  history: "time-outline",
  geography: "earth-outline",
  computer: "desktop-outline",
};

const SUBJECT_IMAGES: Record<string, ImageSourcePropType> = {
  mathematics: mathArt,
  math: mathArt,
  science: scienceArt,
  english: englishArt,
};

export function subjectIcon(name: string): IconName {
  const key = name.trim().toLowerCase();
  return SUBJECT_ICONS[key] || "school-outline";
}

export function subjectImage(name: string): ImageSourcePropType {
  const key = name.trim().toLowerCase();
  return SUBJECT_IMAGES[key] || englishArt;
}

export function chapterImage(): ImageSourcePropType {
  return chapterArt;
}

export function topicImage(): ImageSourcePropType {
  return topicArt;
}
