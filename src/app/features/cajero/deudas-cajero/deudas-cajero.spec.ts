import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeudasCajero } from './deudas-cajero';

describe('DeudasCajero', () => {
  let component: DeudasCajero;
  let fixture: ComponentFixture<DeudasCajero>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeudasCajero],
    }).compileComponents();

    fixture = TestBed.createComponent(DeudasCajero);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
