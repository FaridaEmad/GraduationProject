import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OffersService } from '../../core/services/offers.service';
import { IOffers } from '../../core/interfaces/ioffer';
import { BusinessService } from '../../core/services/business.service';
import { IBusiness } from '../../interfaces/ibusiness';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { take } from 'rxjs'; // استيراد take من rxjs

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [CarouselModule],
  templateUrl: './offer.component.html',
  styleUrls: ['./offer.component.scss']
})
export class OfferComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly offersService = inject(OffersService);
  private readonly businessService = inject(BusinessService);

  detailsProduct: IBusiness | null = null;
  offersList: IOffers[] = [];
  businessId: number = 0;

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    items: 1,
    nav: true
  };

  constructor() {}

  ngOnInit(): void {
    this.route.params.pipe(take(1)).subscribe(params => {
      const id = params['id'];
      if (id) {
        this.businessId = +id;
        this.getOffers();
        this.getBusinessDetails();
      } else {
        console.error('ID parameter is missing from URL');
      }
    });
  }

  private getOffers(): void {
    this.offersService.getOfferByBesinessId(this.businessId)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.offersList = res;
          console.log('Offers List:', this.offersList);
        },
        error: (err) => {
          console.error('Error fetching offers:', err);
        }
      });
  }

  private getBusinessDetails(): void {
    this.businessService.getoneBusiness(this.businessId)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.detailsProduct = res;
          console.log('Business Details:', this.detailsProduct);
        },
        error: (err) => {
          console.error('Error fetching business details:', err);
        }
      });
  }
}
