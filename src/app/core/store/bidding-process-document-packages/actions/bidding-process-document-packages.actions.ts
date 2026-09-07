import {
  BiddingProcessDocumentGroup,
  BiddingProcessDocumentPackage,
  Enumerator,
  FiduciaryProcessDocument,
  ParticipantAwarded,
  ParticipantPackages,
  UploadFiduciaryProcessDocuments,
} from '@core/models';
import { createAction, props } from '@ngrx/store';

export const getDocumentPackages = createAction(
  '[Bidding Process Document Packages] get bidding process document packages',
  props<{ processId: string; isOptional: boolean }>()
);

export const getDocumentPackagesSuccess = createAction(
  '[Bidding Process Document Packages] get bidding process document packages success',
  props<{
    processId: string;
    biddingProcessDocumentPackages: BiddingProcessDocumentPackage[];
    lastBidValidityExtensionDate: Date;
  }>()
);

export const getDocumentGroupsSuccess = createAction(
  '[Bidding Process Document Packages] get bidding process document groups success',
  props<{
    processId: string;
    biddingProcessDocumentPackageId: string;
    biddingProcessDocumentGroups: BiddingProcessDocumentGroup[];
  }>()
);

export const getFiduciaryProcessDocumentsSuccess = createAction(
  '[Fiduciary Process Documents Success] get fiduciary process documents success',
  props<{
    processId: string;
    biddingProcessDocumentGroupId: string;
    fiduciaryProcessDocuments: FiduciaryProcessDocument[];
  }>()
);

export const addFiduciaryProcessDocumentsSuccess = createAction(
  '[Fiduciary Process Documents] add fiduciary process documents',
  props<{
    processId: string;
    biddingProcessDocumentPackageId: string;
    fiduciaryProcessDocuments: FiduciaryProcessDocument[];
    groupId: number;
  }>()
);

export const addDescriptionNotUploadDoc = createAction(
  '[Fiduciary Process Documents] added description to not uploaded fiduciary process documents',
  props<{
    processId: string;
    biddingProcessDocumentPackageId: string;
    fiduciaryProcessDocument: FiduciaryProcessDocument;
  }>()
);

export const addFiduciaryProcessDocuments = createAction(
  '[Fiduciary Process Documents] add fiduciary process documents success',
  props<{ payload: unknown }>()
);

export const addFiduciaryProcessDocumentsError = createAction(
  '[Fiduciary Process Documents] add fiduciary process documents Error',
  props<{ payload: unknown }>()
);

export const removeFiduciaryProcessDocumentsSuccess = createAction(
  '[Fiduciary Process Documents] remove fiduciary process documents',
  props<{
    processId: string;
    biddingProcessDocumentPackageId: string;
    fiduciaryProcessDocument: FiduciaryProcessDocument;
    uploadFile: boolean;
  }>()
);

export const removeFiduciaryProcessDocument = createAction(
  '[Fiduciary Process Documents] remove fiduciary process documents success',
  props<{ payload: unknown }>()
);

export const removeFiduciaryProcessDocumentsError = createAction(
  '[Fiduciary Process Documents] remove fiduciary process documents Error',
  props<{ payload: unknown }>()
);

export const changeResultConfig = createAction(
  '[Fiduciary Process Documents] change result  config',
  props<{ processId: string; packageId: string }>()
);

export const changeResultConfigSuccess = createAction(
  '[Fiduciary Process Documents] change result  config Sucess',
  props<{
    processId: string;
    packageId: string;
    groupId: string;
    fileId: string;
    result: number;
  }>()
);

export const changeResultConfigError = createAction(
  '[Fiduciary Process Documents] change result  config Error',
  props<{ processId: string; packageId: string }>()
);

export const changePackageStatus = createAction(
  '[Fiduciary Process Documents] change package status',
  props<{ processId: string; packageId: string }>()
);

export const changePackageStatusError = createAction(
  '[Fiduciary Process Documents] change package status Error',
  props<{ processId: string; packageId: string }>()
);

export const changePackageStatusSuccess = createAction(
  '[Fiduciary Process Documents] change package status success',
  props<{ processId: string; packageId: string; status: number }>()
);

export const changePackageActualDate = createAction(
  '[Fiduciary Process Documents] change actual date',
  props<{
    processId: string;
    actualDate: Date;
    packageId: string;
    lang: string;
    prevDate: Date;
  }>()
);

export const changePackageActualDateSuccess = createAction(
  '[Fiduciary Process Documents] change actual date success',
  props<{ processId: string; actualDate: Date; packageId: string }>()
);

export const changePackageActualDateError = createAction(
  '[Fiduciary Process Documents] change actual date error',
  props<{ processId: string; packageId: string; prevDate: Date }>()
);

export const updateDocOptionsResult = createAction(
  '[Fiduciary Process Documents] update documents options result',
  props<{
    processId: string;
    packageCode: number;
    groupCode: number;
    documentId: string;
    results: Enumerator[];
    awardedOptions: ParticipantAwarded[];
    selectedAwardeds: string[];
  }>()
);

export const getParticipantsAndActualParticipants = createAction(
  '[Fiduciary Process Documents] get participants options result and actual results',
  props<{
    processId: string;
    packageId: string;
    groupId: string;
    documentId: string;
  }>()
);

export const getParticipantsAndActualParticipantsSucces = createAction(
  '[Fiduciary Process Documents] get participants options result and actual results Success',
  props<{
    processId: string;
    packageId: string;
    groupId: string;
    documentId: string;
    participantsOptions: ParticipantAwarded[];
    awardeds: ParticipantPackages[];
  }>()
);
export const setAwardeds = createAction(
  '[Fiduciary Process Documents] set Awardeds',
  props<{
    processId: string;
    packageId: string;
    groupId: string;
    documentId: string;
    awardeds: string[];
  }>()
);

export const deletePackage = createAction(
  '[Fiduciary Process Documents] delete Additional Package',
  props<{
    processId: string;
    biddingProcessDocumentPackageId: string;
  }>()
);
export const deletePackageSuccess = createAction(
  '[Fiduciary Process Documents] delete Additional Package Success',
  props<{
    processId: string;
    biddingProcessDocumentPackageId: string;
  }>()
);
export const deletePackageError = createAction(
  '[Fiduciary Process Documents] delete Additional Package Error',
  props<{
    processId: string;
  }>()
);

export const updateBidValidityExtensionDate = createAction(
  '[Fiduciary Process Documents] Update Bid Validity Extension Additional Package',
  props<{
    processId: string;
    biddingProcessDocumentPackageId: string;
    bidValidityExtensionDate: Date;
  }>()
);
export const updateBidValidityExtensionDateSuccess = createAction(
  '[Fiduciary Process Documents] Update Bid Validity Extension Additional Package Success',
  props<{
    processId: string;
    biddingProcessDocumentPackageId: string;
    bidValidityExtensionDate: Date;
  }>()
);
export const updateBidValidityExtensionDateError = createAction(
  '[Fiduciary Process Documents] Update Bid Validity Extension Additional Package Error',
  props<{
    processId: string;
  }>()
);
export const addDescriptionExistingDoc = createAction(
  '[Fiduciary Process Documents] update description to Existing Docs',
  props<{
    procurementProcessId: string;
    packageId: string;
    groupCode: number;
    docId: string;
    newDescription: string;
  }>()
);

export const updateDescriptiongDoc = createAction(
  '[Fiduciary Process Documents] update description to Existing Doc',
  props<{
    relationalId: string;
    packageId: string;
    groupId: UploadFiduciaryProcessDocuments;
    description: string;
    procurementProcessId: string;
  }>()
);

export const restoreDescriptiongDoc = createAction(
  '[Fiduciary Process Documents] restore description to Existing Doc',
  props<{
    relationalId: string;
    packageId: string;
    groupId: UploadFiduciaryProcessDocuments;
    procurementProcessId: string;
  }>()
);

export const updateDescriptiongDocSuccess = createAction(
  '[Fiduciary Process Documents] update description to Existing Doc Succes',
  props<{
    relationalId: string;
    packageId: string;
    groupId: UploadFiduciaryProcessDocuments;
    description: string;
    procurementProcessId: string;
  }>()
);

export const updateDescriptiongDocError = createAction(
  '[Fiduciary Process Documents] update description to Existing Doc Error',
  props<{
    relationalId: string;
  }>()
);

export const setLoadingPackage = createAction(
  '[Fiduciary Process Documents] set Loading prop package',
  props<{
    processId: string;
    packageId: string;
    loading: boolean;
  }>()
);
