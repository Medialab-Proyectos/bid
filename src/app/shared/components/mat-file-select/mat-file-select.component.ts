import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PermissionEnum } from '@core/enums';
import { TranslateModule } from '@ngx-translate/core';
import { DisplayByPermissionsSaDirective } from '../../directives/display-by-permissions-standalone.directive';

// Interfaz para el objeto RawFile
export interface RawFile {
  extension: string;
  name: string;
  rawFile: File;
  size: number;
  state: number;
  uid: string;
}

@Component({
  selector: 'fi-mat-file-selector',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    TranslateModule,
    DisplayByPermissionsSaDirective,
  ],
  templateUrl: './mat-file-select.component.html',
  styleUrls: ['./mat-file-select.component.scss'],
})
export class MatFileSelectorComponent {
  @Input() allowedExtensions: string[] = [
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.ppt',
    '.pptx',
    '.jpg',
    '.jpeg',
    '.png',
    '.svg',
    '.msg',
  ];
  @Input() maxSizeMB: number = 256;
  @Input() multiple: boolean = false;
  @Input() fileListVisible: boolean = false;
  @Input() public permission: PermissionEnum[] = [PermissionEnum.SPECIAL];
  @Output() valueChange = new EventEmitter<RawFile[]>();
  @Output() fileRemoved = new EventEmitter<RawFile>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  selectedFiles: RawFile[] = [];
  isDragOver = false;

  constructor(private snackBar: MatSnackBar) {}

  get acceptString(): string {
    return this.allowedExtensions.join(',');
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = Array.from(event.dataTransfer?.files || []);
    this.processFiles(files);
  }

  openFileDialog(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    this.processFiles(files);

    // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
    input.value = '';
  }

  private processFiles(files: File[]): void {
    const validFiles = files.filter((file) => this.validateFile(file));

    if (validFiles.length === 0) return;

    const rawFiles = validFiles.map((file) => this.createRawFile(file));

    if (this.multiple) {
      this.selectedFiles = [...this.selectedFiles, ...rawFiles];
      this.valueChange.emit(rawFiles);
    } else {
      this.selectedFiles = [rawFiles[0]];
      this.valueChange.emit(this.selectedFiles);
    }
  }

  private createRawFile(file: File): RawFile {
    const extension = '.' + (file.name.split('.').pop()?.toLowerCase() || '');

    return {
      extension: extension,
      name: file.name,
      rawFile: file,
      size: file.size,
      state: 2,
      uid: this.generateUID(),
    };
  }

  private generateUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  private validateFile(file: File): boolean {
    // Validar extensión
    if (this.allowedExtensions.length > 0) {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const isValidExtension = this.allowedExtensions.some(
        (ext) => ext.toLowerCase() === fileExtension
      );

      if (!isValidExtension) {
        this.showError(`Tipo de archivo no permitido: ${file.name}`);
        return false;
      }
    }

    // Validar tamaño
    if (this.maxSizeMB > 0) {
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > this.maxSizeMB) {
        this.showError(
          `Archivo muy grande: ${file.name} (${this.formatFileSize(file.size)})`
        );
        return false;
      }
    }

    return true;
  }

  removeFile(index: number): void {
    const removedFile = this.selectedFiles[index];
    this.selectedFiles.splice(index, 1);
    this.fileRemoved.emit(removedFile);
    this.valueChange.emit(this.selectedFiles);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar'],
    });
  }

  // Métodos públicos para uso externo
  clearFiles(): void {
    this.selectedFiles = [];
    this.valueChange.emit([]);
  }

  getFiles(): RawFile[] {
    return this.selectedFiles;
  }

  getRawFiles(): File[] {
    return this.selectedFiles.map((rawFile) => rawFile.rawFile);
  }
}
