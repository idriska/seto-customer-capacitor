import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MapCardComponent } from './map-card.component';

describe('MapCardComponent', () => {
  let component: MapCardComponent;
  let fixture: ComponentFixture<MapCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapCardComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MapCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
