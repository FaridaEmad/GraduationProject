export interface IReview {
  reviewId?: number;
  createdAt?: string;
  rating: number;
  text: string;
  userId: number;
  businessId: number;
  user?: any;
  business?: any;
}
