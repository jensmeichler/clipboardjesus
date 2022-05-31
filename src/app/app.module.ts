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
import {MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule} from "@angular/material/form-field";
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
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {HttpClientModule} from '@angular/common/http';
import {HttpClient} from "@angular/common/http";
import {
  AboutDialogComponent,
  DeleteDialogComponent,
  EditNoteDialogComponent,
  EditTabDialogComponent,
  EditTaskListDialogComponent,
  ImportDialogComponent,
  SaveAsDialogComponent,
  ImageComponent,
  NoteComponent,
  TabComponent,
  TaskListComponent,
  NoteListComponent,
  EditNoteListDialogComponent,
  SmallNoteComponent,
  HashyComponent,
  HashyAnimatedComponent,
  SignatureComponent
} from './components';
import {
  AutofocusDirective,
  CursorDirective,
  DragDropDirective,
  HighlightColorDirective
} from './directives';
import {_blank} from "./const";

export function markedOptionsFactory(): MarkedOptions {
  const renderer = new MarkedRenderer();

  renderer.link = (href: string | null, title: string | null, text: string) => {
    if (!title) return `<a href="${href}" target="${_blank}">${text}</a>`;
    return `<a title="${title}" href="${href}" target="${_blank}">${text}</a>`;
  };
  renderer.options.breaks = true;
  renderer.text = (text: string) => {
    while (text.match(/^(&nbsp;)*?\s+/)) {
      text = text.replace(' ', '&nbsp;');
    }
    return text;
  }

  return {renderer};
}

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    NoteComponent,
    EditNoteDialogComponent,
    EditTaskListDialogComponent,
    TaskListComponent,
    ImageComponent,
    DragDropDirective,
    AboutDialogComponent,
    SaveAsDialogComponent,
    TabComponent,
    EditTabDialogComponent,
    DeleteDialogComponent,
    AutofocusDirective,
    CursorDirective,
    ImportDialogComponent,
    HighlightColorDirective,
    NoteListComponent,
    EditNoteListDialogComponent,
    SmallNoteComponent,
    HashyAnimatedComponent,
    SignatureComponent,
    HashyComponent,
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
    }),
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    {
      provide: HIGHLIGHT_OPTIONS,
      useValue: {
        fullLibraryLoader: () => import('highlight.js'),
        themePath: 'assets/styles/highlight.css'
      }
    },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {appearance: 'fill'}
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
