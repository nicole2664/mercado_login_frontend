import { TestBed } from '@angular/core/testing';
import { Pagination } from '../../shared/components/pagination/pagination';

describe('Pagination', () => {
  let service: Pagination;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Pagination);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
