import { editorialImage } from "./objects/editorialImage";
import { pullQuote, sourceLink } from "./objects/shared";
import { article } from "./documents/article";
import {
  artistProfile,
  author,
  breakingItem,
  category,
  correction,
  event,
  shortClip,
  sponsor,
  videoEpisode,
} from "./documents/core";
import { homepageSettings, siteSettings } from "./documents/settings";

export const schemaTypes = [
  // objects
  editorialImage,
  pullQuote,
  sourceLink,
  // documents
  article,
  author,
  category,
  videoEpisode,
  shortClip,
  event,
  artistProfile,
  sponsor,
  breakingItem,
  correction,
  homepageSettings,
  siteSettings,
];
