import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  BiddingProcessDocumentGroup,
  ActionType,
  GetBiddingProcessDocumentGroupsByDocumentPackageIdResponse,
  GetProcessDocumentPackageByProcurementIdResponse,
} from '@core/models';
import { HttpRequestController } from '@fiduciary-interface-test';
import { environment } from '@fiduciary-interface/environments/environment';
import { FileInfo } from '@progress/kendo-angular-upload';

import { BiddingProcessDocumentPackagesApiService } from './bidding-process-document-packages-api.service';

const basePath = environment.hostApi.fiduciaryProcessApi.endpoint;
const basePathDocuments = `${environment.hostApi.fiduciaryProcessApi.endpoint}/api/biddingProcessPackageDocuments`;
const basePathDocumentPackage = `${environment.hostApi.fiduciaryProcessApi.endpoint}/api/biddingProcessDocumentPackages`;
const basePathDocumentPackagev2 = `${environment.hostApi.fiduciaryProcessApi.endpoint}/api/v2/document-packages`;

describe('BiddingProcessDocumentPackagesApiService', () => {
  let service: BiddingProcessDocumentPackagesApiService;
  let http: HttpRequestController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HttpRequestController],
    });
    service = TestBed.inject(BiddingProcessDocumentPackagesApiService);
    http = TestBed.inject(HttpRequestController);
  });

  describe('Document package services', () => {
    it('should get bidding process document packages', () => {
      const responseMock: GetProcessDocumentPackageByProcurementIdResponse = {
        biddingProcessDocumentPackage: [],
        lastBidValidityExtensionDate: null,
      };
      const biddingProcessProcurementProcessId = 'COD-1234l-123rBG';
      service
        .getBiddingProcessDocumentPackages(
          biddingProcessProcurementProcessId,
          false
        )
        .subscribe((response) => {
          expect(response).toEqual(responseMock);
        });

      const url = `${basePath}/api/biddingProcessProcurementProcesses/${biddingProcessProcurementProcessId}/biddingProcessDocumentPackages?isOptional=false`;
      http.mockRequest(url, 'get', responseMock);
    });
  });

  describe('Documents groups services', () => {
    it('should get bidding process document groups', () => {
      const responseMock: GetBiddingProcessDocumentGroupsByDocumentPackageIdResponse =
        { biddingProcessDocumentGroups: [] };
      const biddingProcessDocumentPackageId = 'COD-1234l-123rBG';
      service
        .getBiddingProcessDocumentGroups(biddingProcessDocumentPackageId)
        .subscribe((response) => {
          expect(response).toEqual(responseMock);
        });

      const url = `${basePath}/api/biddingProcessDocumentPackages/${biddingProcessDocumentPackageId}/biddingProcessDocumentGroups`;
      http.mockRequest(url, 'get', responseMock);
    });

    it('should get bidding process document groups', () => {
      const responseMock: BiddingProcessDocumentGroup = null;
      const biddingProcessDocumentPackageId = 'COD-1234l-123rBG';
      const docGroup: BiddingProcessDocumentGroup = null;
      service
        .editBiddingProcessDocumentGroups(
          biddingProcessDocumentPackageId,
          docGroup
        )
        .subscribe((response) => {
          expect(response).toEqual(responseMock);
        });

      const url = `${basePath}/api/biddingProcessDocumentPackages/${biddingProcessDocumentPackageId}/biddingProcessDocumentGroups`;
      http.mockRequest(url, 'put', responseMock);
    });

    it('should get getFiduciaryProcessDocuments', () => {
      const responseMock: BiddingProcessDocumentGroup = null;
      const biddingProcessDocumentGroupId =
        'b410fee8-c85d-4993-a413-3f8bf6710a44';
      const domain = 2;

      service
        .getFiduciaryProcessDocuments(biddingProcessDocumentGroupId, domain)
        .subscribe((response) => {
          expect(response).toEqual(responseMock);
        });

      const url = `${basePath}/api/fiduciaryProcessDocuments?domain=${domain}&parentId=${biddingProcessDocumentGroupId}`;
      http.mockRequest(url, 'get', responseMock);
    });

    it('should delete bidding process document', () => {
      const responseMock: BiddingProcessDocumentGroup = null;
      const biddingProcessPackageDocumentId =
        'f7ceab85-19fd-4657-84f5-f927de1cc2f9';
      const biddingProcessDocumentPackageId =
        '7c9cffaa-7877-438b-9512-0e608a57e2a4';
      service
        .deleteBiddingProcessPackageDocument(
          biddingProcessPackageDocumentId,
          biddingProcessDocumentPackageId
        )
        .subscribe((response) => {
          expect(response).toEqual(responseMock);
        });

      const url = `${basePathDocuments}/${biddingProcessPackageDocumentId}?biddingProcessDocumentPackageId=${biddingProcessDocumentPackageId}`;
      http.mockRequest(url, 'delete', responseMock);
    });

    it('should upload bidding process document', () => {
      const biddingProcessDocumentGroupId =
        '3fa85f64-5717-4562-b3fc-2c963f66afa6';
      const fileInfo: FileInfo = { name: 'file', rawFile: null };
      const domain = 2;

      service
        .uploadBiddingProcessPackageDocument(
          biddingProcessDocumentGroupId,
          domain,
          fileInfo,
          'EN'
        )
        .subscribe((response) => {
          expect(response).toEqual(fileInfo);
          const url = `${basePath}/api/fiduciaryProcessDocuments?parentId=${biddingProcessDocumentGroupId}&domain=${domain}`;
          http.mockRequest(url, 'post', null);
        });
    });

    it('should confirm package for disclosure', () => {
      const biddingProcessDocumentPackageId =
        '3fa85f64-5717-4562-b3fc-2c963f66afa6';
      service
        .submitPackageForNonObjection(
          biddingProcessDocumentPackageId,
          ActionType.NON_OBJECTION
        )
        .subscribe((response) => {
          expect(response).toEqual(null);
        });
      const url = `${basePathDocumentPackage}/${biddingProcessDocumentPackageId}/submitPackage/nonObjection?type=${ActionType.NON_OBJECTION}`;
      http.mockRequest(url, 'put', null);
    });

    it('should confirm package for disclosure', () => {
      const biddingProcessDocumentPackageId =
        '3fa85f64-5717-4562-b3fc-2c963f66afa6';
      service
        .submitPackageForDisclosure(biddingProcessDocumentPackageId)
        .subscribe((response) => {
          expect(response).toEqual(null);
        });
      const url = `${basePathDocumentPackage}/${biddingProcessDocumentPackageId}/submitPackage/disclosure`;
      http.mockRequest(url, 'put', null);
    });

    it('should confirm package for disclosure', () => {
      const biddingProcessDocumentPackageId = '';

      service
        .completePackage(
          biddingProcessDocumentPackageId,
          false,
          ActionType.CONFIRM
        )
        .subscribe((response) => {
          expect(response).toEqual(null);
        });

      const url = `${basePathDocumentPackagev2}/${biddingProcessDocumentPackageId}/complete`;
      http.mockRequest(url, 'put', {
        type: 0,
        isOptional: false,
      });
    });

    it('should updateDocumentPackageActualDate', () => {
      const biddingProcessDocumentPackageId =
        '3fa85f64-5717-4562-b3fc-2c963f66afa6';
      const date = new Date();

      service
        .updateDocumentPackageActualDate(
          date,
          biddingProcessDocumentPackageId,
          'EN'
        )
        .subscribe((response) => {
          expect(response).toEqual(date);
        });

      const url = `${basePathDocumentPackage}/${biddingProcessDocumentPackageId}/actualDate?lang=EN`;
      http.mockRequest(url, 'put', date);
    });

    it('should delete bidding process document', () => {
      const responseMock: BiddingProcessDocumentGroup = null;
      const documentId = 'f7ceab85-19fd-4657-84f5-f927de1cc2f9';
      const domain = 4;
      service
        .deleteFiduciaryProcessDocument(documentId, domain)
        .subscribe((response) => {
          expect(response).toEqual(responseMock);
        });

      const url = `${basePath}/api/fiduciaryProcessDocuments/${documentId}?domain=${domain}`;
      http.mockRequest(url, 'delete', responseMock);
    });

    it('should update Result And Awardeds bidding process document', () => {
      const responseMock: BiddingProcessDocumentGroup = null;
      const documentGroupId = 'f7ceab85-19fd-4657-84f5-f927de1cc2f9';
      const documentGroupResultId = 1;
      const awardedIdList: string[] = ['', ''];
      service
        .updateResultAndAwardeds(
          documentGroupId,
          documentGroupResultId,
          awardedIdList
        )
        .subscribe((response) => {
          expect(response).toEqual(responseMock);
        });

      const url = `${basePathDocumentPackage}/documentGroup/${documentGroupId}/result`;
      http.mockRequest(url, 'put', responseMock);
    });

    it('should update status bidding process document', () => {
      const responseMock: BiddingProcessDocumentGroup = null;
      const biddingProcessDocumentPackageId =
        'f7ceab85-19fd-4657-84f5-f927de1cc2f9';
      const status = 1;
      service
        .updateStatus(biddingProcessDocumentPackageId, status)
        .subscribe((response) => {
          expect(response).toEqual(responseMock);
        });

      const url = `${basePathDocumentPackage}/${biddingProcessDocumentPackageId}/status`;
      http.mockRequest(url, 'put', status);
    });

    it('should completion bidding process document', () => {
      const responseMock: BiddingProcessDocumentGroup = null;
      const biddingProcessDocumentPackageId =
        'f7ceab85-19fd-4657-84f5-f927de1cc2f9';
      service
        .completion(biddingProcessDocumentPackageId)
        .subscribe((response) => {
          expect(response).toEqual(responseMock);
        });

      const url = `${basePathDocumentPackage}/${biddingProcessDocumentPackageId}/completion`;
      http.mockRequest(url, 'put', null);
    });

    it('should update Document Package ActualDate bidding process document', () => {
      const responseMock: BiddingProcessDocumentGroup = null;
      const actualDate = new Date();
      const biddingProcessDocumentPackageId =
        'f7ceab85-19fd-4657-84f5-f927de1cc2f9';
      const lang = 'es';
      service
        .updateDocumentPackageActualDate(
          actualDate,
          biddingProcessDocumentPackageId,
          lang
        )
        .subscribe((response) => {
          expect(response).toEqual(responseMock);
        });

      const url = `${basePathDocumentPackage}/${biddingProcessDocumentPackageId}/actualDate?lang=${lang}`;
      http.mockRequest(url, 'put', actualDate);
    });
  });
});
