export interface ICart {

    cartId: number;
  totalAmount: number;
  noOfItems: number;
  isActive: boolean;
  userId: number;
  user: any | null;        // حط هنا الـ interface الخاص بالمستخدم أو استخدم any إذا ما عندك
  bookings: any[];  
}
