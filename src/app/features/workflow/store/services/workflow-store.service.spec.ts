import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { WorkflowStoreService } from './workflow-store.service';

describe('WorkflowStoreService', () => {
  let service: WorkflowStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideMockStore({})],
    });
    service = TestBed.inject(WorkflowStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
