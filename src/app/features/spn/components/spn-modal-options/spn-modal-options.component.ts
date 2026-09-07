import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'fi-spn-modal-options',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatRadioModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    TranslateModule,
  ],
  templateUrl: './spn-modal-options.component.html',
  styleUrls: ['./spn-modal-options.component.scss'],
})
export class SpnModalOptionsComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { packageId: string }) {
    this.packageId = data.packageId;
  }

  private readonly router = inject(Router);
  private readonly dialogRef = inject(MatDialogRef<SpnModalOptionsComponent>);

  selectedOption: string = 'sdp';
  packageId: string;

  closeModal(): void {
    this.dialogRef.close();
  }

  redirectToSpn(): void {
    const newUrl = `${this.router.url}/${this.packageId}/spn/register/${this.selectedOption}`;
    if (newUrl !== this.router.url) {
      this.closeModal();
      this.router.navigateByUrl(newUrl);
    }
  }
}
