import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RolesService } from './roles.service';
import { StoreModule } from '@ngrx/store';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { provideMockStore } from '@ngrx/store/testing';
import { UserApiService } from '@core/services/apis';
import { Contact, PermissionResponse, RoleResponseBody } from '@core/models';
import { TranslateService } from '@ngx-translate/core';

const initialState = {
  contact: {
    contact: {
      username: 'username',
      email: 'email@gmail.com',
      name: 'name',
      given_name: 'given_name',
      family_name: 'family_name',
      is_internal: false,
      contactId: 'contactId',
    },
  },
  selectedProject: {
    selectedProject: {
      contract: 'contractNumber',
    },
  },
};
const userApiMock = {
  getRoles: jest.fn(),
  getPermissions: jest.fn(),
};
const translateServiceMock = {
  instant: jest.fn(),
};
describe('RolesService', () => {
  let service: RolesService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        StoreModule.forRoot({}),
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      providers: [
        provideMockStore({ initialState }),
        {
          provide: UserApiService,
          useValue: userApiMock,
        },
        {
          provide: TranslateService,
          useValue: translateServiceMock,
        },
      ],
    });
    service = TestBed.inject(RolesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return contact', () => {
    service['contact'] = { ...contactInternal };
    service.getContact();
    expect(service['contact']).toEqual(contactInternal);
  });

  describe('getPermissionRequest', () => {
    it('should get permission request for internal user and contractNumber is undefined', () => {
      const rolesArray: RoleResponseBody[] = [
        { roleIdCode: 'role1', roleType: 'type1', roleName: 'roleName1' },
        { roleIdCode: 'role2', roleType: 'type2', roleName: 'roleName2' },
      ];
      service['allRoles'] = { ...mockGetPermissionResponse };
      service['contact'] = { ...contactInternal };

      service.getPermissionRequest(rolesArray).subscribe((request) => {
        expect(request.contractNumber).toBe('');
        expect(request.operationNumber).toBe('');

        expect(request.roles).toEqual([
          { roleIdCode: 'role1', roleType: 'type1', roleName: 'roleName1' },
          { roleIdCode: 'role2', roleType: 'type2', roleName: 'roleName2' },
        ]);
      });
    });

    it('should get permission request for internal user and contractNumber is NOT undefined', (done) => {
      const array: RoleResponseBody[] = [
        { roleIdCode: 'role1', roleType: 'type1', roleName: 'roleName-1' },
        { roleIdCode: 'role2', roleType: 'type2', roleName: 'roleName-2' },
      ];

      service['contact'] = { ...contactInternal };
      service['contractNumber'] = 'contractNumber';
      service['operationNumber'] = 'operationNumber';

      service['allRoles'] = { ...mockGetPermissionResponse };

      service.getPermissionRequest(array).subscribe((request) => {
        expect(request.contractNumber).toBe('contractNumber');
        expect(request.operationNumber).toBe('operationNumber');

        expect(request.roles).toEqual([
          {
            roleIdCode: mockGetPermissionResponse.permissions[0].roleIdCode,
            roleType: mockGetPermissionResponse.permissions[0].roleType,
            roleName: mockGetPermissionResponse.permissions[0].roleName,
          },
        ]);
        done();
      });
    });
  });
});

const contactInternal: Contact = {
  username: 'usernameInternal',
  email: 'email@idb.org',
  name: 'name',
  given_name: 'given_name',
  family_name: 'family_name',
  is_internal: true,
  contactId: 'contactId',
};

const mockGetPermissionResponse: PermissionResponse = {
  permissions: [
    {
      roleType: 'roleType',
      roleIdCode: 'roleIdCode',
      roleName: 'roleName2',
      operationNumber: 'operationNumber',
      operationType: 'operationType',
      contractNumber: 'contractNumber',
      permissions: [
        {
          permissionCode: 'permissionCode',
          permission: 'permission',
          permissionDescription: 'permissionDescription',
        },
      ],
    },
  ],
  paging: {
    totalRecords: 1,
    next: 'next',
    preview: 'preview',
    last: 'last',
    first: 'first',
  },
};
