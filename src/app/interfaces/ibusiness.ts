// export interface IBusiness {
//     id: number;
//   title: string;
//   price: number;
//   description: string;
//   category: string;
//   images: string[];
//   rating: number;
// }
export interface IBusiness {
    id: number;
    name: string;
    city: string;
    area: string;
    logo: string;
    categoryId: number;
    userId: number;
    imageUrls: string[]; // لاحظ إنها مصفوفة من الصور
    averageRates: number;
    noOfReviews: number;
  }
  