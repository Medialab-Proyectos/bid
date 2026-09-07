import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmCancelDialogComponent } from './confirm-cancel-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { PipeModule } from '../../pipes/pipe.module';



@NgModule({
  declarations: [
    ConfirmCancelDialogComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    PipeModule,
    TranslateModule
  ],
  exports: [ConfirmCancelDialogComponent]
})
export class ConfirmCancelDialogModule { }
