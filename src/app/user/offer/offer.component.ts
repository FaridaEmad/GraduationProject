import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router'; // استيراد ActivatedRoute
import { OffersService } from '../../core/services/offers.service';
import { IOffers } from '../../core/interfaces/ioffer';

@Component({
  selector: 'app-offers',
  templateUrl: './offer.component.html',
  styleUrls: ['./offer.component.scss']
})
export class OfferComponent implements OnInit {

  offersList: IOffers[] = [];
  businessId: number = 0; // متغير لحفظ الـ businessId

  constructor(
    private route: ActivatedRoute, // حقن ActivatedRoute
    private _OffersServices: OffersService
  ) {}

  ngOnInit(): void {
    // قراءة الـ businessId من الـ URL
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.businessId = +params['id']; // تحويل الـ id إلى رقم
        this.getOffers(); // استدعاء الدالة للحصول على العروض بناءً على الـ businessId
      } else {
        console.error('ID parameter is missing from URL');
      }
    });
  }

  getOffers(): void {
    this._OffersServices.getOfferByBesinessId(this.businessId).subscribe({
      next: (res) => {
        this.offersList = res;
        console.log(this.offersList);
      },
      error: (err) => {
        console.log(err);
      }
    });
  }
}
