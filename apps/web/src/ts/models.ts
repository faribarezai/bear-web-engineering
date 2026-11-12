// Bear Object
export interface Bear {
  id: string;
  name: string;
  binomial: string;
  image: string | null;
  range: string;
}
// erweitern um author, createdAt und bearID
export interface CommentItem {
  id: string;
  bearId: string;
  author: string;
  text: string;
  createdAt: string;
}
