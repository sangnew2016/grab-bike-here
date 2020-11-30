import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BookABikeComponent } from './book-a-bike.component';

describe('BookABikeComponent', () => {
  let component: BookABikeComponent;
  let fixture: ComponentFixture<BookABikeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BookABikeComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BookABikeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
