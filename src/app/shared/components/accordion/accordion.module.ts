import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { AccordionPanelComponent } from "./components/accordion-panel/accordion-panel.component";

@NgModule({
    declarations: [
        AccordionPanelComponent
    ],
    imports: [
        CommonModule
    ],
    exports: [
        CommonModule,
        AccordionPanelComponent
    ]
})
export class AccordionModule { }
