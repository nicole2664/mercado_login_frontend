import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagosCajero } from './pagos-cajero';

describe('PagosCajero', () => {
  let component: PagosCajero;
  let fixture: ComponentFixture<PagosCajero>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagosCajero],
    }).compileComponents();

    fixture = TestBed.createComponent(PagosCajero);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
