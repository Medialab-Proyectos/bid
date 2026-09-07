import { FiduciaryProcessDocument } from '@core/models';
import { createAction, props } from '@ngrx/store';

export const getProcurementDocuments = createAction(
  '[General procurement documents] get procurement documents',
  props<{ projectBucketId: string; domain: number }>()
);

export const getProcurementDocumentsSuccess = createAction(
  '[General procurement documents] get procurement documents success',
  props<{ generalProcurementDocuments: FiduciaryProcessDocument[] }>()
);

export const deleteProcurementDocument = createAction(
  '[General procurement documents] delete procurement document',
  props<{ documentId: string }>()
);

export const deleteProcurementDocumentSuccess = createAction(
  '[General procurement documents] delete procurement document success',
  props<{ documentId: string }>()
);

export const deleteProcurementDocumentError = createAction(
  '[General procurement documents] delete procurement document error'
);

export const changeStatus = createAction(
  '[General procurement documents] change document status',
  props<{ id: string; status: number }>()
);
