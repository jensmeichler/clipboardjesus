import {Injectable} from '@angular/core';
import {MatSnackBar} from "@angular/material/snack-bar";

@Injectable({
  providedIn: 'root'
})
export class HashyService {
  constructor(private readonly snackBar: MatSnackBar) {
  }

  show(text: string, seconds?: number) {
    this.snackBar.open(text,
      undefined, {duration: seconds ? seconds * 1000 : 4000, horizontalPosition: "left"});

    //TODO: show hashy via jQuery (add class show-hashy)
  }
}
