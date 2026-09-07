import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnChanges,
} from '@angular/core';
import { NoticeType, ProjectInfo, ProjectInfoField } from '../../models';
import { LoadProjectDataService } from '../../services/load-project-data.service';
import { FormGroup } from '@angular/forms';
import { EoiFormModel } from '@fiduciary-interface/app/features/eoi/forms/eoi.forms';
@Component({
  selector: 'fi-project-info',
  templateUrl: './project-info.component.html',
  styleUrls: ['./project-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectInfoComponent implements OnChanges {
  private loadProjectDataService = inject(LoadProjectDataService);
  @Input() projectInfo: ProjectInfo;
  @Input() eoiFormGroup: FormGroup<EoiFormModel>;
  @Input() isPreview: boolean = true;
  @Input() lang: string;
  @Input() noticeType: NoticeType = NoticeType.EOI;
  projectInfoFields: ProjectInfoField[];

  ngOnChanges(): void {
    if (this.projectInfo) {
      this.projectInfoFields = this.loadProjectDataService.getKeysFromObj(
        this.projectInfo,
        this.noticeType
      );
    }
  }
}
