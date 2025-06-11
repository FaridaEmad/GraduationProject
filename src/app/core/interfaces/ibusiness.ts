import { IReview } from "./ireview";

// export interface IBusiness {
//   id: number;
//   name: string;
//   city: string;
//   area: string;
//   logo: string;
//   categoryId: number;
//   userId: number;
//   averageRates: number;
//   noOfReviews: number;
//   imageUrls: string[];
//   reviews: IReview[];
// }
export interface IBusiness {
  businessId: number;
  name: string;
  city: string;
  area: string;
  logo: string;
  categoryId: number;
  userId: number;
  category: any | null;
  user: any | null;
  images: IImage[];   
  offers: any[];
  reviews: any[];
}

export interface IBusinessImage {
  imageURLId: number;
  businessId: number;
  url: string;
  business: any | null;
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

// core/interfaces/iimage.ts
export interface IImage {
  imageId: number;   // 0 = صورة جديدة لم تُحفَظ بعد
  url: string;
}