import { HeaderFeatureComponent } from './components/header-feature/header-feature.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardHeaderComponent } from './components/card-header/card-header.component';
import { LayoutModule } from '@progress/kendo-angular-layout';

@NgModule({
  declarations: [HeaderFeatureComponent, CardHeaderComponent],
  imports: [CommonModule, LayoutModule],
  exports: [HeaderFeatureComponent, CardHeaderComponent],
})
export class HeaderFeatureModule {}
