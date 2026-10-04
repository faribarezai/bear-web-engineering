// Ergebnis des Parses
export interface BearRow {
  name: string;
  binomial: string;
  fileName: string | null;
  range: string;
}
// Bear Object
export interface Bear {
  name: string;
  binomial: string;
  image: string | null;
  range: string;
}
export interface CommentItem {
  id: string;
  name: string;
  comment: string;
}
