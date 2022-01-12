import {DragDropModule} from "@angular/cdk/drag-drop";
import {NgModule} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {MatBadgeModule} from "@angular/material/badge";
import {MatBottomSheetModule} from "@angular/material/bottom-sheet";
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from "@angular/material/card";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatChipsModule} from "@angular/material/chips";
import {MatRippleModule} from "@angular/material/core";
import {MatDialogModule} from "@angular/material/dialog";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {MatListModule} from "@angular/material/list";
import {MatMenuModule} from "@angular/material/menu";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {MatTabsModule} from "@angular/material/tabs";
import {MatTooltipModule} from "@angular/material/tooltip";
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule} from "@angular/router";
import {ServiceWorkerModule} from '@angular/service-worker';
import {FileSaverModule} from "ngx-filesaver";
import {HIGHLIGHT_OPTIONS, HighlightModule} from "ngx-highlightjs";
import {MarkdownModule, MarkedOptions, MarkedRenderer} from "ngx-markdown";
import {environment} from '../environments/environment';
import {AppComponent} from './app.component';
import {AboutDialogComponent} from './components/dialogs/about-dialog/about-dialog.component';
import {DeleteDialogComponent} from './components/dialogs/delete-dialog/delete-dialog.component';
import {EditNoteDialogComponent} from './components/dialogs/edit-note-dialog/edit-note-dialog.component';
import {EditTabDialogComponent} from './components/dialogs/edit-tab-dialog/edit-tab-dialog.component';
import {EditTaskListDialogComponent} from './components/dialogs/edit-task-list-dialog/edit-task-list-dialog.component';
import {ImportDialogComponent} from './components/dialogs/import-dialog/import-dialog.component';
import {SaveAsDialogComponent} from './components/dialogs/save-as-dialog/save-as-dialog.component';
import {ImageComponent} from './components/image/image.component';
import {NoteComponent} from './components/note/note.component';
import {TabComponent} from './components/tab/tab.component';
import {TaskListComponent} from './components/task-list/task-list.component';
import {CustomAutofocusDirective} from './directives/custom-autofocus.directive';
import {CustomCursorDirective} from './directives/custom-cursor.directive';
import {CustomDragDropDirective} from './directives/custom-drag-drop.directive';

export function markedOptionsFactory(): MarkedOptions {
  const renderer = new MarkedRenderer();

  renderer.link = (href: string | null, title: string | null, text: string) => {
    return '<a title="' + title + '" href="' + href + '" target="_blank">' + text + '</a>';
  };

  return {renderer};
}

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
    CustomCursorDirective,
    ImportDialogComponent,
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
    MatTabsModule,
    FileSaverModule,
    RouterModule.forRoot([]),
    HighlightModule,
    MarkdownModule.forRoot({
      markedOptions: {
        provide: MarkedOptions,
        useFactory: markedOptionsFactory,
      }
    })
  ],
  providers: [{
    provide: HIGHLIGHT_OPTIONS,
    useValue: {
      fullLibraryLoader: () => import('highlight.js'),
      themePath: 'assets/styles/highlight.css'
    }
  }],
  bootstrap: [AppComponent],
})
export class AppModule {
}
