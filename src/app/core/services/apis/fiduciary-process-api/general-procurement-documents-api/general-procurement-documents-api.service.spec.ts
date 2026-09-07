import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@fiduciary-interface/environments/environment';
import { HttpRequestController } from '@fiduciary-interface-test';
import { GeneralProcurementDocumentsApiService } from './general-procurement-documents-api.service';
import {
  DiscloseDocument,
  GeneralProcurementDocumentResponse,
  GroupsResponse,
  UploadBiddingProcessPackageDocuments,
} from '@core/models';
import { DocumentDomain } from '@core/enums';
import { FileInfo } from '@progress/kendo-angular-upload';
import { of } from 'rxjs';

const basePath = environment.hostApi.fiduciaryProcessApi.endpoint;

describe('GeneralProcurementDocumentsApiService', () => {
  let service: GeneralProcurementDocumentsApiService;
  let httpMock: HttpRequestController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HttpRequestController],
    });
    service = TestBed.inject(GeneralProcurementDocumentsApiService);
    httpMock = TestBed.inject(HttpRequestController);
  });

  it('should get general procurement documents', () => {
    const projectBucketId = 'id';
    const responseMock: GeneralProcurementDocumentResponse = {
      parentId: '',
      fiduciaryProcessDocuments: [],
    };
    const domain = 4;

    service
      .getGeneralProcurementDocuments(projectBucketId, domain)
      .subscribe((response) => {
        expect(response).toEqual(responseMock);
      });
    const url = `${basePath}/api/fiduciaryProcessDocuments?domain=${domain}&parentId=${projectBucketId}`;
    httpMock.mockRequest(url, 'get', responseMock);
  });

  it('should delete general procurement document', () => {
    const responseMock = null;

    service
      .deleteGeneralProcurementDocument('123456', DocumentDomain.PROJECTBUCKET)
      .subscribe((response) => {
        expect(response).toEqual(responseMock);
      });
    const url = `${basePath}/api/fiduciaryProcessDocuments/123456?domain=4`;
    httpMock.mockRequest(url, 'delete', responseMock);
  });

  it('should submit general procurement document for disclosure', () => {
    const responseMock = null;

    service
      .submitForDisclosure('123456', '12356', DocumentDomain.PROJECTBUCKET)
      .subscribe((response) => {
        expect(response).toEqual(responseMock);
      });
    const url = `${basePath}/api/fiduciaryProcessDocuments/123456?domain=4&parentId=12356`;
    httpMock.mockRequest(url, 'put', responseMock);
  });

  it('should send to edit Document', () => {
    const responseMock = null;

    service
      .sendToEditDocument('1', '2', DocumentDomain.PROJECTBUCKET)
      .subscribe((response) => {
        expect(response).toEqual(responseMock);
      });
    const url = `${basePath}/api/fiduciaryProcessDocuments/1?domain=4&parentId=2`;
    httpMock.mockRequest(url, 'put', responseMock);
  });

  it('should send to disclosure', () => {
    const responseMock = null;
    const documentId = '1';
    const discloseDocument: DiscloseDocument = {
      language: 'en',
      stageCode: 'stageCode',
    };

    service
      .sendDisclosure(documentId, discloseDocument)
      .subscribe((response) => {
        expect(response).toEqual(responseMock);
      });
    const url = `${basePath}/api/fiduciaryProcessDocuments/${documentId}/disclose`;

    httpMock.mockRequest(url, 'post', responseMock);
  });

  it('should upload a bidding process package document', () => {
    const biddingProcessDocumentGroupId = '123';
    const domain = DocumentDomain.BIDDINGCONTRACTDOCUMENTGROUP;
    const file: FileInfo = {
      name: 'xd',
    };
    const lang = 'en';
    const uploadResponse: UploadBiddingProcessPackageDocuments = {
      relationalId: 'relationalId',
      newFileName: 'newFileName',
      fiduciaryProcessDocumentId: 'fiduciaryProcessDocumentId',
    };
    const uploadBiddingProcessPackageDocumentSpy = jest
      .spyOn(service['docSvc'], 'uploadBiddingProcessPackageDocument')
      .mockReturnValue(of(uploadResponse));

    service
      .setGeneralProcurementDocument(
        biddingProcessDocumentGroupId,
        domain,
        file,
        lang
      )
      .subscribe((result: UploadBiddingProcessPackageDocuments) => {
        expect(result).toEqual(uploadResponse);
      });

    expect(uploadBiddingProcessPackageDocumentSpy).toHaveBeenCalledWith(
      biddingProcessDocumentGroupId,
      domain,
      file,
      lang
    );
  });

  it('should change group of the Document', () => {
    const domain = DocumentDomain.BIDDINGCONTRACTDOCUMENTGROUP;
    const documentId = 'documentId';
    const parentId = 'parentId';

    const sendToEditDocumentSpy = jest
      .spyOn(service, 'sendToEditDocument')
      .mockReturnValue(of('response'));

    service.changeGroupOfDocument(documentId, parentId, domain);

    expect(sendToEditDocumentSpy).toHaveBeenCalledWith(
      documentId,
      parentId,
      domain
    );
  });

  it('should getGroups', () => {
    const responseMock: GroupsResponse = {
      groups: [
        {
          id: 'id-1',
          mandatory: true,
          code: 1,
        },
        {
          id: 'id-2',
          mandatory: false,
          code: 2,
        },
      ],
    };
    const responseMock2: GeneralProcurementDocumentResponse = {
      parentId: '',
      fiduciaryProcessDocuments: [
        {
          id: 'id-1',
          relationalId: '',
          ezshareNumber: '',
          name: '',
          operationsDocumentId: 3,
          status: 1,
          type: 1,
          modified: new Date(),
          created: new Date(),
          createdBy: '',
          description: '',
        },
      ],
    };
    const domain = DocumentDomain.BIDDINGCONTRACTDOCUMENTGROUP;
    const parentId = 'parent';
    jest
      .spyOn(service, 'getGeneralProcurementDocuments')
      .mockReturnValue(of(responseMock2));
    service.getGroups(domain, parentId).subscribe((response) => {
      expect(response).toEqual(responseMock);
    });
    const url = `${basePath}/api/groups?domain=${domain}&parentId=${parentId}`;

    httpMock.mockRequest(url, 'get', responseMock);
  });
});
