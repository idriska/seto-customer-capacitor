import { Component, Inject } from '@angular/core';
import { Constants } from '../../models/constants.models';
import { AppConfig, APP_CONFIG } from '../../app.config';
import { RouterWrapperService } from 'src/app/services/router-wrapper.service';
import { Events } from 'src/app/services/event-handler.service';

@Component({
  selector: 'page-managelanguage',
  templateUrl: 'managelanguage.html',
  styleUrls: ["managelanguage.scss"]
})
export class ManagelanguagePage {
  private defaultLanguageCode = "en";

  constructor(@Inject(APP_CONFIG) private config: AppConfig, private events: Events, private navCtrl: RouterWrapperService,) {
    let defaultLang = window.localStorage.getItem(Constants.KEY_DEFAULT_LANGUAGE);
    this.defaultLanguageCode = (defaultLang && defaultLang.length) ? defaultLang : this.config.availableLanguages[0].code;
  }

  onLanguageClick(language) {
    this.defaultLanguageCode = language.code;
  }

  languageConfirm() {
    this.events.publish('language:selection', this.defaultLanguageCode);
    window.localStorage.setItem(Constants.KEY_DEFAULT_LANGUAGE, this.defaultLanguageCode);
    let userMe = JSON.parse(window.localStorage.getItem(Constants.KEY_USER));
    this.navCtrl.push(userMe ? "search" : "signin");
  }

}
