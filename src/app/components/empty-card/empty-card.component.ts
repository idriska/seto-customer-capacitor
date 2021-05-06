import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'empty-card',
  templateUrl: './empty-card.component.html',
  styleUrls: ['./empty-card.component.scss'],
})
export class EmptyCardComponent implements OnInit {
  @Input() message: string;
  constructor() { }

  ngOnInit() {}

}
