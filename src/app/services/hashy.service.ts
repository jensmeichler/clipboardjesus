import {Injectable} from '@angular/core';
import {MatSnackBar} from "@angular/material/snack-bar";

@Injectable({
  providedIn: 'root'
})
export class HashyService {
  constructor(private readonly snackBar: MatSnackBar) {
  }

  async show(text: string, milliseconds: number) {
    document.getElementsByClassName('hashy')[0].classList.add('show-hashy');

    await this.snackBar.open(text, undefined, {
      duration: milliseconds,
      horizontalPosition: "left"
    }).afterDismissed().toPromise();

    document.getElementsByClassName('hashy')[0].classList.remove('show-hashy');
  }
}
