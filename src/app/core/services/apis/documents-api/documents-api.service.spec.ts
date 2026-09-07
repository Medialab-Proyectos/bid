import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HttpRequestController } from '@fiduciary-interface-test';
import { environment } from '@fiduciary-interface/environments/environment';

import { BiddingProcessDocumentPackagesOLDApiService } from './documents-api.service';

const basePath = environment.hostApi.fiduciaryProcessApi.endpoint;

describe('BiddingProcessDocumentPackagesOLDApiService', () => {
  let service: BiddingProcessDocumentPackagesOLDApiService;
  let httpMock: HttpRequestController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HttpRequestController],
    });
    service = TestBed.inject(BiddingProcessDocumentPackagesOLDApiService);
    httpMock = TestBed.inject(HttpRequestController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should get document by id', () => {
    const id = '12345';
    const responseMock = ['document1'];

    service.getDocumentById(id).subscribe((document) => {
      expect(document).toEqual(responseMock);
    });

    httpMock.mockRequest(
      `${basePath}/api/documents/${id}`,
      'get',
      responseMock
    );
  });

  it('should get document sas token', () => {
    const id = '12345';
    const responseMock = 'token 123456789';
    service.getDocumentSasToken(id).subscribe((document) => {
      expect(document).toEqual(responseMock);
    });

    httpMock.mockRequest(
      `${basePath}/api/documents/${id}/generate-token`,
      'get',
      responseMock
    );
  });

  it('should upload document sas token', () => {
    const responseMock = 'token 123456789';
    service.uploadDocumentSasToken().subscribe((document) => {
      expect(document).toEqual(responseMock);
    });

    httpMock.mockRequest(
      `${basePath}/api/documents/generate-upload-token`,
      'get',
      responseMock
    );
  });

  it('should upload document to blob storage', () => {
    const documentRequest = {};
    const responseMock = {
      documentId: '123',
    };
    service.uploadToBlobStorage(documentRequest).subscribe((document) => {
      expect(document).toEqual(responseMock);
    });

    httpMock.mockRequest(
      `${basePath}/api/documents/upload-blobstorage`,
      'post',
      responseMock
    );
  });

  it('should upload document to easyshare', () => {
    const documentRequest = {};
    const responseMock = {
      documentId: '123',
    };
    service.requestUploadToEasyShare(documentRequest).subscribe((document) => {
      expect(document).toEqual(responseMock);
    });

    httpMock.mockRequest(
      `${basePath}/api/documents/upload-easyshare`,
      'post',
      responseMock
    );
  });

  it('should upload document flow', () => {
    const responseMock = {
      documentId: '123',
    };
    service.uploadDocumentFlow().subscribe((document) => {
      expect(document).toEqual(responseMock);
    });
    const tokenReponse = 'token 123456789';
    httpMock.mockRequest(
      `${basePath}/api/documents/generate-upload-token`,
      'get',
      tokenReponse
    );
    httpMock.mockRequest(
      `${basePath}/api/documents/upload-blobstorage`,
      'post',
      responseMock
    );
    httpMock.mockRequest(
      `${basePath}/api/documents/upload-easyshare`,
      'post',
      responseMock
    );
  });

  describe('upload document flow', () => {
    it('should upload document flow', () => {
      const responseMock = {
        documentId: '123',
      };
      service.uploadDocumentFlow().subscribe((document) => {
        expect(document).toEqual(responseMock);
      });
      const tokenReponse = 'token 123456789';
      httpMock.mockRequest(
        `${basePath}/api/documents/generate-upload-token`,
        'get',
        tokenReponse
      );
      httpMock.mockRequest(
        `${basePath}/api/documents/upload-blobstorage`,
        'post',
        responseMock
      );
      httpMock.mockRequest(
        `${basePath}/api/documents/upload-easyshare`,
        'post',
        responseMock
      );
    });

    it('should throw error when request for upload token sas fails', () => {
      service.uploadDocumentFlow().subscribe(
        () => {},
        (error) => {
          expect(error).toBe('sas error');
        }
      );
      const tokenReponse = 'error';
      httpMock.mockRequest(
        `${basePath}/api/documents/generate-upload-token`,
        'get',
        tokenReponse,
        { status: 500, statusText: 'error' }
      );
    });

    it('should throw error when request for upload document blob storage fails', () => {
      const responseMock = 'error';
      service.uploadDocumentFlow().subscribe(
        () => {},
        (error) => {
          expect(error).toBe('blob error');
        }
      );
      const tokenReponse = 'token 123456789';
      httpMock.mockRequest(
        `${basePath}/api/documents/generate-upload-token`,
        'get',
        tokenReponse
      );
      httpMock.mockRequest(
        `${basePath}/api/documents/upload-blobstorage`,
        'post',
        responseMock,
        { status: 500, statusText: 'error' }
      );
    });

    it('should throw error when request for upload document to easyshare fails', () => {
      service.uploadDocumentFlow().subscribe(
        () => {},
        (error) => {
          expect(error).toBe('easysharee error');
        }
      );
      const blobStorageResponseMock = { documentId: '123' };
      const tokenReponse = 'token 123456789';
      const easyShareResponseMock = 'error';
      httpMock.mockRequest(
        `${basePath}/api/documents/generate-upload-token`,
        'get',
        tokenReponse
      );
      httpMock.mockRequest(
        `${basePath}/api/documents/upload-blobstorage`,
        'post',
        blobStorageResponseMock
      );
      httpMock.mockRequest(
        `${basePath}/api/documents/upload-easyshare`,
        'post',
        easyShareResponseMock,
        { status: 500, statusText: 'error' }
      );
    });
  });
});
