import { Component, Input, OnInit } from '@angular/core';
import { Ride } from 'src/app/interface/ride';
import { Helper } from 'src/app/models/helper.models';

@Component({
  selector: 'ride-card',
  templateUrl: './ride-card.component.html',
  styleUrls: ['./ride-card.component.scss'],
})
export class RideCardComponent implements OnInit {

  @Input() ride: Ride;
  currency: string;
  constructor() {
    this.currency = Helper.getSetting("currency");
    this.currency === 'EUR' ? this.currency = '€' : undefined
   }

  ngOnInit() {}

}
