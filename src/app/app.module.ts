import {NgModule} from '@angular/core';
import {MatBottomSheetModule} from "@angular/material/bottom-sheet";
import {MatChipsModule} from "@angular/material/chips";
import {BrowserModule} from '@angular/platform-browser';
import {AppComponent} from './app.component';
import {NoteComponent} from './components/note/note.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatListModule} from "@angular/material/list";
import {MatCardModule} from "@angular/material/card";
import {DragDropModule} from "@angular/cdk/drag-drop";
import {MatRippleModule} from "@angular/material/core";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatMenuModule} from "@angular/material/menu";
import {EditNoteDialogComponent} from './components/dialogs/edit-note-dialog/edit-note-dialog.component';
import {MatDialogModule} from "@angular/material/dialog";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {FormsModule} from "@angular/forms";
import {EditTaskListDialogComponent} from './components/dialogs/edit-task-list-dialog/edit-task-list-dialog.component';
import {TaskListComponent} from './components/task-list/task-list.component';
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatTooltipModule} from "@angular/material/tooltip";
import {ImageComponent} from './components/image/image.component';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';
import {CustomDragDropDirective} from './directives/custom-drag-drop.directive';
import {AboutDialogComponent} from './components/dialogs/about-dialog/about-dialog.component';
import {MatBadgeModule} from "@angular/material/badge";
import {SaveAsDialogComponent} from './components/dialogs/save-as-dialog/save-as-dialog.component';
import {MatTabsModule} from "@angular/material/tabs";
import {TabComponent} from './components/tab/tab.component';
import {EditTabDialogComponent} from './components/dialogs/edit-tab-dialog/edit-tab-dialog.component';
import {DeleteDialogComponent} from './components/dialogs/delete-dialog/delete-dialog.component';
import {CustomAutofocusDirective} from './directives/custom-autofocus.directive';

@NgModule({
  declarations: [
    AppComponent,
    NoteComponent,
    EditNoteDialogComponent,
    EditTaskListDialogComponent,
    TaskListComponent,
    ImageComponent,
    CustomDragDropDirective,
    AboutDialogComponent,
    SaveAsDialogComponent,
    TabComponent,
    EditTabDialogComponent,
    DeleteDialogComponent,
    CustomAutofocusDirective,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatListModule,
    MatCardModule,
    DragDropModule,
    MatRippleModule,
    MatSnackBarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDialogModule,
    MatBottomSheetModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatChipsModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatBadgeModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000'
    }),
    MatTabsModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
}
