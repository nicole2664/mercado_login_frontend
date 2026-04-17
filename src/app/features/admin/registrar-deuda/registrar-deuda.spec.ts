import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarDeuda } from './registrar-deuda';

describe('RegistrarDeuda', () => {
  let component: RegistrarDeuda;
  let fixture: ComponentFixture<RegistrarDeuda>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrarDeuda],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrarDeuda);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
