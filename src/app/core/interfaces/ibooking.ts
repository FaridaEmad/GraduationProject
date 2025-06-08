import { ICart } from "./icart";
import { IOffers } from "./ioffer";
import { IUser } from "./iuser";

export interface IBooking {
    bookingId: number;
    bookingDate: string;
    quantity: number;
    offerId: number;
    userId: number;
    cartId: number;
    offer: IOffers|null;   // تأكد تحط النوع الصحيح إذا كان فيه تفاصيل عرض
    user: IUser|null;    // تأكد تحط النوع الصحيح إذا كان فيه تفاصيل المستخدم
    cart: ICart|null;    // تأكد تحط النوع الصحيح إذا كان فيه تفاصيل الكارت
}
