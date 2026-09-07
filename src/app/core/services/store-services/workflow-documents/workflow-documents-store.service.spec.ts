import { TestBed } from '@angular/core/testing';

import { WorkflowDocumentsStoreService } from './workflow-documents-store.service';
import { StoreModule } from '@ngrx/store';

describe('WorkflowDocumentsStoreService', () => {
  let service: WorkflowDocumentsStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({})],
    });
    service = TestBed.inject(WorkflowDocumentsStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
