import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {Location} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class RouterWrapperService {

  data: any = { };
  constructor(private router: Router, private location: Location ) { }
  push(url, data = {}) {
    this.data = data;
    this.router.navigate(['/' + url]);
  }

  pop() {
    this.location.back();
  }
  
  getData(key) {
    return this.data[key];
  }
}