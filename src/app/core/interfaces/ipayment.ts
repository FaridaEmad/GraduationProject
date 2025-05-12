export interface IPayment {
  paymentId: number;
  status: 'Pending' | 'Confirmed' | 'Failed';
  totalPrice: number;
  createdAt: string; // يفضل تسيبيه string لو بيجيلك بصيغة ISO من الباكيند
  userId: number;
  cartId: number;
  paymentMethodId: number;
  user?: any; // خليهم اختياريين لو بيرجعوا null
  cart?: any;
  paymentMethod?: IPaymentMethod;
}

export interface IPaymentMethod {
  paymentMethodId: number;
  method: string;
  fees: number;
  payments?: IPayment[]; // أو any[] لو مش هتستخدم التفاصيل دلوقتي
}
