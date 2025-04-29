import { ICart } from "./icart";
import { IOffers } from "./ioffer";

export interface IBooking {
    bookingId: number;
    bookingDate: string;
    quantity: number;
    offerId: number;
    userId: number;
    cartId: number;
    offer: IOffers;   // تأكد تحط النوع الصحيح إذا كان فيه تفاصيل عرض
    user: any;    // تأكد تحط النوع الصحيح إذا كان فيه تفاصيل المستخدم
    cart: ICart;    // تأكد تحط النوع الصحيح إذا كان فيه تفاصيل الكارت
}
