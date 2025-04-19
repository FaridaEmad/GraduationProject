import { OwlOptions } from './../../../../node_modules/ngx-owl-carousel-o/lib/models/owl-options.model.d';
import { Component, inject, OnInit } from '@angular/core';
import { IBusiness } from '../../interfaces/ibusiness';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { BusinessService } from '../../core/services/business.service';
import { CarouselModule } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-detail',
  imports: [CarouselModule],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss'
})
export class DetailComponent  {
  private readonly __ActivatedRoute= inject(ActivatedRoute);
  private readonly __ProductsService= inject(BusinessService);
  
  detailsproduct:IBusiness |null= null;
  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    items:1,
    nav: true
  }
  ngOnInit(): void {
    
    //   this.__ActivatedRoute.paramMap.subscribe({
    //     next:(data)=>{
    //      let productId= data.get('id');
    //      this.__ProductsService.getoneBusiness(productId).subscribe({
    //        next:(res)=>{
    //          console.log(res.product);
    //          this.detailsproduct=res.product;
             
           
             
    //        },
    //        error:(err)=>{
    //          console.log(err);
    //        }
    //      })
    //     }
    //   })
  }

  

}

