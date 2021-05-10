import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'headings',
  templateUrl: './headings.component.html',
  styleUrls: ['./headings.component.scss'],
})
export class HeadingsComponent implements OnInit {


  @Input() title: string;
  @Input() subTitle: string;
  constructor(private translate: TranslateService) { }

  ngOnInit() {

  }

}
