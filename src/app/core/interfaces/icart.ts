export interface ICart {
    cartId: number;
    totalAmount: number;
    noOfItems: number;
    isActive: boolean;
    userId: number;
    user: any; // أو تقدر تعرف Interface لـ user لو احتجته
    bookings: any[]; // أو برضو تعرف Interface لـ booking لو احتجته
}