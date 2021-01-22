import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Constants } from '../models/constants.models';

/*
  Generated class for the LanguageProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class LanguageProvider {

  constructor(public http: HttpClient) {
    console.log('Hello LanguageProvider Provider');
  }

  getLanguage(){
    return window.localStorage.getItem(Constants.KEY_DEFAULT_LANGUAGE);
  }
}
