export interface IBooking {
    bookingId: number;
  userId: number;
  user: any; // إذا كنت تحتاج تعرف تفاصيل المستخدم، يمكنك تخصيص هذا النوع.
  offerId: number;
  offer: any; // إذا كنت تحتاج تفاصيل العرض، يمكنك تخصيص هذا النوع.
  cartId: number;
  cart: any; // إذا كنت تحتاج تفاصيل السلة، يمكنك تخصيص هذا النوع.
  quantity: number;
  bookingDate: string; // أو Date إذا كنت ترغب في التعامل مع التاريخ بشكل صحيح.
}
