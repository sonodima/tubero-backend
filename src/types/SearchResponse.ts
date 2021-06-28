export type SearchItem = {
  v?: string;
  title?: string;
  author?: string;
  thumbnail?: string | null;
};

type SearchResponse = {
  error?: string;
  corrected?: string;
  results?: SearchItem[];
};

export default SearchResponse;
