import { Iwishlist } from "./iwishlist";

export interface IOffers {
    offerId: number;
    startDate: string;
    endDate: string;
    discountPercentage: number;
    description: string;
    image: string;
    price: number;
    businessId: number;
    business: any;
    bookings: any[];
    wishlists: Iwishlist[];
}
