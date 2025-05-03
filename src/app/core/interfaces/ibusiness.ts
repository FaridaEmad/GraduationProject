export interface IBusiness {
  id: number;
  name: string;
  city: string;
  area: string;
  logo: string;
  categoryId: number;
  userId: number;
  averageRates: number;
  noOfReviews: number;
  imageUrls: string[];
}

export interface IBusinessCreate {
  name: string;
  city: string;
  area: string;
  logo: string;
  categoryId: number;
  userId: number;
  imageUrls: string[];
}

export interface IBusinessUpdate {
  name: string;
  city: string;
  area: string;
  logo: string;
  categoryId: number;
  userId: number;
}
