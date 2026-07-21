import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaCompra } from './lista-compra';

describe('ListaCompra', () => {
  let component: ListaCompra;
  let fixture: ComponentFixture<ListaCompra>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaCompra],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaCompra);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
