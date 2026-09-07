import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { WindowSizeService } from '@core/services/view';
import { Card } from './model/card.model';
import { OperationPreference, PreferencesModel } from '@core/models';
import { AppStateWithProjects, AppStateWithUsrPreferences } from '@core/store';
import { Store } from '@ngrx/store';
import { ProjectStoreService } from '@core/services/store-services';
import * as preferencesActions from '@core/store/preferences/actions/preferences.actions';

@Component({
  selector: 'fi-project-card',
  templateUrl: './project-card.component.html',
})
export class ProjectCardComponent implements OnDestroy, OnInit {
  mobileView: boolean;
  expanded: boolean;
  projectName: string;

  @Input() data: Card;
  @Input() actualPreference: PreferencesModel;
  @Output() selectedCardEmitter: EventEmitter<object> =
    new EventEmitter<object>();

  constructor(
    readonly windowSvc: WindowSizeService,
    readonly storePreferences: Store<AppStateWithUsrPreferences>,
    readonly storeProjects: Store<AppStateWithProjects>,
    readonly projectStoreSvc: ProjectStoreService
  ) {
    this.initMobileConditionals();
  }
  readonly subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.getLanguageSelected();
  }

  initMobileConditionals(): void {
    const sub = this.windowSvc.windowSizeChanged.subscribe((data) => {
      this.mobileView = data.mobileView;
      this.expanded = !data.mobileView;
    });
    this.subscriptions.push(sub);
  }

  toogleExpanded(): void {
    this.expanded = !this.expanded;
  }

  selectedCard(opNumber: string, contract: string): void {
    if (!this.mobileView) {
      this.selectedCardEmitter.emit({
        operation: opNumber,
        contract: contract,
      });
    }
  }

  selectedCardMobile(opNumber: string, contract: string): void {
    this.selectedCardEmitter.emit({ operation: opNumber, contract: contract });
  }

  addOrRemove(projectsList: OperationPreference[]): OperationPreference[] {
    let index = projectsList.findIndex(
      (p) => p.projectBucket === this.data.project.projectBucketId
    );
    if (index === -1) {
      let projects = [...projectsList];
      let newOp: OperationPreference = {
        projectBucket: this.data.project.projectBucketId,
        operationNumber: this.data.project.operationNumber,
        contractNumber: this.data.project.contract,
      };
      projects.push(newOp);
      return projects; // Devuelve el array actualizado
    } else {
      return projectsList.filter(
        (p) => p.projectBucket !== this.data.project.projectBucketId
      );
    }
  }

  addfavorite(evento) {
    evento.stopPropagation();
    this.storePreferences.dispatch(
      preferencesActions.updateProjectPreferences({
        actualPreferences: this.actualPreference,
        operationPreference: {
          projectBucketId: this.data.project.projectBucketId,
          operationNumber: this.data.project.operationNumber,
          contractNumber: this.data.project.contract,
        },
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((el) => {
      el.unsubscribe();
    });
  }

  getLanguageSelected(): void {
    this.projectName = this.data?.project?.name;

    const sub = this.projectStoreSvc
      .languageSelected()
      .subscribe(({ preferences: { preferredLanguage } }) => {
        const projectNameMap = {
          es: this.data?.project?.nameEs,
          fr: this.data?.project?.nameFr,
          pt: this.data?.project?.namePt,
        };

        this.projectName = projectNameMap[preferredLanguage]?.trim()
          ? projectNameMap[preferredLanguage]
          : this.projectName;
      });

    this.subscriptions.push(sub);
  }
}
