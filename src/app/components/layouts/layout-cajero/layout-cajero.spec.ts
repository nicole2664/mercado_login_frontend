import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutCajero } from './layout-cajero';

describe('LayoutCajero', () => {
  let component: LayoutCajero;
  let fixture: ComponentFixture<LayoutCajero>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutCajero],
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutCajero);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
