import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Enumerator, FiduciaryProcessDocument } from '@core/models';
import { TranslateModule } from '@ngx-translate/core';
import { TextFieldModule } from '@angular/cdk/text-field';

@Component({
  selector: 'fi-mat-file-list',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    FormsModule,
    MatIconModule,
    MatTooltipModule,
    TranslateModule,
    TextFieldModule,
    NgFor,
  ],
  templateUrl: './mat-file-list.component.html',
  styleUrls: ['./mat-file-list.component.scss'],
})
export class MatFileListComponent {
  @Output() deleteFile = new EventEmitter<FiduciaryProcessDocument>();
  @Output() editFile = new EventEmitter<FiduciaryProcessDocument>();

  @Input() files: FiduciaryProcessDocument[] = [];
  @Input() groupEnum: Enumerator[] = [];

  onGroupChange(newValue: any, file: FiduciaryProcessDocument) {
    const previousGroupCode = file.groupCode;

    this.editFile.emit({
      ...file,
      groupCode: newValue,
      description: file.description,
      previousGroupCode: previousGroupCode,
    });
  }

  updateFileDescription(event) {
    this.editFile.emit(event);
  }

  deleteContractFile(event) {
    this.deleteFile.emit(event);
  }
}
