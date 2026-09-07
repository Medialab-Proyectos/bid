import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@fiduciary-interface/environments/environment';
import { HttpRequestController } from '@fiduciary-interface-test';
import { ProcessConfiguration } from './process-configuration.service';
import { GetSettingsResponse, KeyValue, KeyValueInput } from '@core/models';
import { SettingActionType, SettingType } from '@core/enums';
import { of } from 'rxjs';

describe('ProcessConfiguration', () => {
  let service: ProcessConfiguration;
  let httpMock: HttpRequestController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HttpRequestController],
    });
    service = TestBed.inject(ProcessConfiguration);
    httpMock = TestBed.inject(HttpRequestController);
  });

  afterEach(() => {
    httpMock?.verify();
  });

  const apiUrl = environment.hostApi.fiduciaryProcessApi.endpoint;

  it('should get settings', () => {
    const responseMock: GetSettingsResponse = { settings: [] };

    service.settings().subscribe((response) => {
      expect(response).toEqual(responseMock);
    });
    const url = `${apiUrl}/api/v2/settings`;
    httpMock.mockRequest(url, 'get', responseMock);
  });

  it('should get settings without settings undefined parameter', () => {
    const responseMock: GetSettingsResponse = { settings: [] };
    const attributes: KeyValue[] = [null];
    service.settings(attributes).subscribe((response) => {
      expect(response).toEqual(responseMock);
    });
    const url = `${apiUrl}/api/v2/settings`;
    httpMock.mockRequest(url, 'get', responseMock);
  });

  it('should get settings with attributes parameter', () => {
    const attributes: KeyValue[] = [{ key: 'attribute', value: 'value' }];
    const responseMock: GetSettingsResponse = { settings: [] };

    service.settings(attributes).subscribe((response) => {
      expect(response).toEqual(responseMock);
    });
    const url = `${apiUrl}/api/v2/settings?attributes%5B0%5D.key=attribute&attributes%5B0%5D.value=value`;
    httpMock.mockRequest(url, 'get', responseMock);
  });

  it('should get settings with setting action type parameter', () => {
    const attributes: KeyValue[] = [];
    const settingActionType: SettingActionType = SettingActionType.Extend;
    const responseMock: GetSettingsResponse = { settings: [] };

    service.settings(attributes, settingActionType).subscribe((response) => {
      expect(response).toEqual(responseMock);
    });
    const url = `${apiUrl}/api/v2/settings?settingActionType=0`;
    httpMock.mockRequest(url, 'get', responseMock);
  });

  it('should get settings with setting type parameter', () => {
    const attributes: KeyValue[] = [];
    const settingActionType: SettingActionType = SettingActionType.Extend;
    const settingType: SettingType = SettingType.Method;
    const responseMock: GetSettingsResponse = { settings: [] };

    service
      .settings(attributes, settingActionType, settingType)
      .subscribe((response) => {
        expect(response).toEqual(responseMock);
      });
    const url = `${apiUrl}/api/v2/settings?settingActionType=0&settingType=2`;
    httpMock.mockRequest(url, 'get', responseMock);
  });

  it('should get settings with is numeric values parameter', () => {
    const attributes: KeyValue[] = [];
    const settingActionType: SettingActionType = SettingActionType.Extend;
    const settingType: SettingType = SettingType.Method;
    const isNumericValues = false;
    const responseMock: GetSettingsResponse = { settings: [] };

    service
      .settings(attributes, settingActionType, settingType, isNumericValues)
      .subscribe((response) => {
        expect(response).toEqual(responseMock);
      });
    const url = `${apiUrl}/api/v2/settings?settingActionType=0&settingType=2`;
    httpMock.mockRequest(url, 'get', responseMock);
  });

  it('should get settings with key value input and is numeric values parameter', () => {
    const attributes: KeyValueInput[] = [{ key: 'attribute', value: 0 }];
    const settingActionType: SettingActionType = SettingActionType.Partial;
    const settingType: SettingType = SettingType.ParticipantFields;
    const isNumericValues = true;
    const responseMock: GetSettingsResponse = { settings: [] };

    service
      .settings(attributes, settingActionType, settingType, isNumericValues)
      .subscribe((response) => {
        expect(response).toEqual(responseMock);
      });
    const url = `${apiUrl}/api/v2/settings?attributes%5B0%5D.key=attribute&attributes%5B0%5D.value=0&settingActionType=2&settingType=5&isNumericValues=true`;
    httpMock.mockRequest(url, 'get', responseMock);
  });

  it('should return threshold settings correctly', (done) => {
    const attributes: KeyValue[] = [{ key: 'attribute', value: 'value' }];
    const isNumericValues = true;

    const responseMock: GetSettingsResponse = {
      settings: [
        {
          id: '1',
          type: 'Threshold',
          attributes: [],
          values: '{"min": 10, "max": 20}',
          modified: '2023-07-01',
        },
      ],
    };

    jest.spyOn(service, 'settings').mockReturnValue(of(responseMock));

    service
      .thresholdSettings(attributes, isNumericValues)
      .subscribe((result) => {
        const expectedThreshold = { min: 10, max: 20 };
        expect(result).toEqual(expectedThreshold);
        done();
      });
  });

  it('should parse thresholds correctly', () => {
    const thresholdString = '{"min": 10, "max": 20}';
    const expectedThreshold = { min: 10, max: 20 };

    const result = service.parseThresholds(thresholdString);

    expect(result).toEqual(expectedThreshold);
  });
});
