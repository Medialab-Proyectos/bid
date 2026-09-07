import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommentFilterForm, FilterComment } from '../../models';
import { FormGroup } from '@angular/forms';
import { CommentsEventBussService } from '../../services/comments-event-buss.service';
import { Subject, Subscription, combineLatest, takeUntil } from 'rxjs';
import { ViewTabComment } from '../../enums/viewTabComment.enum';
import { DropdownComments } from '../../enums';
import { NavigationStart, Router } from '@angular/router';
import { ProcurementCommentsFilterService } from '../../services/procurement-comments-filter.service';
import {
  CommentsVisibility,
  PermissionEnum,
  ProcurementCommentTypeEnum,
} from '@core/enums';
import {
  ModalService,
  NotificationGlobalService,
} from '@fiduciary-interface/app/shared';
import { DialogResponse, ModalOptions } from '@core/models';
import { ProcurementCommentsService } from '../../services/procurement-comments.service';
import { CommentsDomain } from '@fiduciary-interface/app/shared/components/dialog-comments/models';
import { TranslateService } from '@ngx-translate/core';
import { PermissionService } from '@core/services/app/permission/permission.service';

@Component({
  selector: 'fi-comments-filter',
  templateUrl: './comments-filter.component.html',
})
export class CommentsFilterComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  public visibilityPermissionsExternal: PermissionEnum[] = [
    PermissionEnum.VIEW_PROCUREMENT_INFORMATION,
  ];
  public visibilityPermissionInternal: PermissionEnum[] = [
    PermissionEnum.VIEW_PROCUREMENT_INFORMATION,
  ];

  constructor(
    readonly commentsSvc: CommentsEventBussService,
    private router: Router,
    readonly procurementCommentsFilterService: ProcurementCommentsFilterService,
    readonly fiModalSvc: ModalService,
    readonly procurementCommentsService: ProcurementCommentsService,
    private readonly translate: TranslateService,
    private readonly notificationGlobalSvc: NotificationGlobalService,
    private readonly permissionSvc: PermissionService
  ) {}

  planView = true;
  activeView: boolean;
  groupedTab: boolean;
  editingMode: boolean;
  sub: Subscription = new Subscription();
  selectCommentsMode = false;
  commentsFilterForm: FormGroup<CommentFilterForm> =
    this.commentsSvc.initializeForm();
  commentVisibityEnum = CommentsVisibility;
  planOptions = [
    {
      text: 'PROCUREMENT.COMMENTS_TAB.FILTER.DROPDOWN.ACTIVE_HISTORIC',
      value: DropdownComments.ACTIVE_HISTORIC,
    },
  ];

  processOptions = [
    {
      text: 'PROCUREMENT.COMMENTS_TAB.FILTER.DROPDOWN.ACTIVE_HISTORIC',
      value: DropdownComments.ACTIVE_HISTORIC,
    },
    {
      text: 'PROCUREMENT.COMMENTS_TAB.FILTER.DROPDOWN.BY_PROCUREMENT_PROCESS',
      value: DropdownComments.PROCESS,
    },
  ];
  public listItems: Array<{ text: string; value: DropdownComments }> =
    this.planOptions;
  hasPermission = false;
  showFilters = true;

  ngOnInit(): void {
    this.applyFilter();
    this.setVersions();
    this.sub.add(
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.commentsSvc.selectCommentsMode = false;
        }
      })
    );
    this.sub.add(
      this.commentsSvc.selectCommentOption$.subscribe(
        (data) => (this.editingMode = data)
      )
    );
    this.sub.add(
      this.commentsSvc.selectCommentsMode$.subscribe(
        (data) => (this.selectCommentsMode = data)
      )
    );
    this.sub.add(
      combineLatest([
        this.commentsSvc.viewTab$,
        this.commentsSvc.activeTab$,
        this.commentsSvc.groupedTab$,
      ])
        .pipe(takeUntil(this.destroy$))
        .subscribe(([viewTab, activeTab, groupedTab]) => {
          this.planView = viewTab === ViewTabComment.PLAN;
          this.activeView = activeTab;
          this.groupedTab = groupedTab;
          this.listItems =
            viewTab === ViewTabComment.PLAN && !groupedTab
              ? this.planOptions
              : this.processOptions;
          if (groupedTab) {
            this.commentsFilterForm
              .get('dropdownSelection')
              .setValue(DropdownComments.PROCESS);
          }
          if (activeTab) {
            this.commentsFilterForm
              .get('dropdownSelection')
              .setValue(DropdownComments.ACTIVE_HISTORIC);
          }
        })
    );

    this.hasPermission = this.checkPermissions();
  }

  onInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const filteredValue = inputElement.value.replace(/[^a-zA-Z0-9\s-]/g, '');
    inputElement.value = filteredValue;
    this.commentsFilterForm
      .get('processId')
      ?.setValue(filteredValue, { emitEvent: false });
  }

  filtersToggle(): void {
    this.showFilters = !this.showFilters;
  }

  checkPermissions(): boolean {
    const hasPermissionExternal = this.permissionSvc.haveSomePermissions(
      this.visibilityPermissionsExternal
    );
    const hasPermissionInternal = this.permissionSvc.haveSomePermissions(
      this.visibilityPermissionInternal
    );
    return hasPermissionExternal || hasPermissionInternal;
  }

  valueChange(value: DropdownComments): void {
    if (value === DropdownComments.PROCESS) {
      const currentUrl = this.router.url;
      const parts = currentUrl.split('/');
      const lastPart = parts[parts.length - 1];
      const newLastPart = 'groupByProcess';
      const newUrl = currentUrl.replace(lastPart, newLastPart);
      this.router.navigateByUrl(newUrl);
    } else {
      const currentUrl = this.router.url;
      const parts = currentUrl.split('/');
      const lastPart = parts[parts.length - 1];
      const newLastPart = 'active';
      const newUrl = currentUrl.replace(lastPart, newLastPart);
      this.router.navigateByUrl(newUrl);
    }
  }
  setVersions(): void {
    this.sub.add(
      this.commentsFilterForm.controls.activeVersion.valueChanges.subscribe(
        (data) => {
          this.procurementCommentsFilterService.setVersions(data);
        }
      )
    );
  }
  ngOnDestroy(): void {
    this.commentsSvc.resetCurrentFormValue();
    this.sub.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  applyFilter(): void {
    if (!this.commentsFilterForm.valid) {
      return;
    }
    const filters: FilterComment = {
      user: this.commentsFilterForm.controls.user.value,
      visibility: this.commentsFilterForm.controls.visibility.value,
      dateRange: {
        initialDate:
          this.commentsFilterForm.controls.dateRange.controls.initialDate.value,
        endDate:
          this.commentsFilterForm.controls.dateRange.controls.endDate.value,
      },
      processId: this.commentsFilterForm.controls.processId.value,
      processName: this.commentsFilterForm.controls.processName.value,
      marked: this.commentsFilterForm.controls.marked.value,
    };

    this.commentsSvc.currentFormValue = filters;
  }

  resetFilter(): void {
    this.commentsFilterForm = this.commentsSvc.initializeForm();
    const filters: FilterComment = {
      user: this.commentsFilterForm.controls.user.value,
      visibility: this.commentsFilterForm.controls.visibility.value,
      dateRange: {
        initialDate:
          this.commentsFilterForm.controls.dateRange.controls.initialDate.value,
        endDate:
          this.commentsFilterForm.controls.dateRange.controls.endDate.value,
      },
      processId: this.commentsFilterForm.controls.processId.value,
      processName: this.commentsFilterForm.controls.processName.value,
      marked: this.commentsFilterForm.controls.marked.value,
    };
    this.commentsSvc.currentFormValue = filters;
  }

  selectComments(): void {
    this.commentsSvc.selectCommentsMode = !this.selectCommentsMode;
    if (this.commentsSvc.selectCommentsMode) {
      this.commentsSvc.selectedComments = [];
    }
  }

  changeCommentsVisibility(e: string): void {
    this.sub.add(
      this.fiModalSvc
        .open(
          'PROCUREMENT.COMMENTS_TAB.MODAL.TITTLE',
          [
            { text: 'PROCUREMENT.COMMENTS_TAB.MODAL.OPTION.CANCEL' },
            {
              text: 'PROCUREMENT.COMMENTS_TAB.MODAL.OPTION.CONFIRM',
              cssClass: 'k-primary',
            },
          ],
          [
            {
              key: 'PROCUREMENT.COMMENTS_TAB.MODAL.CONTENT',
              bold: false,
            },
          ]
        )
        .subscribe((data: DialogResponse) => {
          if (data.result === ModalOptions.ACCEPT) {
            const domain =
              this.commentsSvc.commenType ===
                ProcurementCommentTypeEnum.PROCESS ||
              this.commentsSvc.commenType ===
                ProcurementCommentTypeEnum.PROCESS_DETAIL
                ? CommentsDomain.BIDDINGPROCESSPROCUREMENTPROCESS
                : CommentsDomain.BIDDINGPROCESSPLAN;
            this.commentsSvc.loading = true;
            this.procurementCommentsService
              .updateComments(
                domain,
                this.commentsSvc.mapSelectedComments(Number(e))
              )
              .subscribe({
                next: (data) => {
                  const msg = this.translate.instant(
                    'PROCUREMENT.COMMENTS_TAB.FILTER.UPDDATE_COMMENTS.SUCCESS'
                  );
                  this.notificationGlobalSvc.showSuccess(msg);
                  this.commentsSvc.commentsUpdateVisibility = data;
                  this.commentsSvc.loading = false;
                  this.commentsSvc.selectCommentsMode = false;
                },
                error: () => {
                  const msg = this.translate.instant(
                    'PROCUREMENT.COMMENTS_TAB.FILTER.UPDDATE_COMMENTS.ERROR'
                  );
                  this.notificationGlobalSvc.showError(msg);
                  this.commentsSvc.loading = false;
                },
                complete: () => {},
              });
          } else {
            this.commentsSvc.selectedComments = {};
            this.commentsSvc.selectCommentsMode = false;
          }
        })
    );
  }
}
