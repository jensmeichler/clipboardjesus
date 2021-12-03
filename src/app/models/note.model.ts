export class Note {
  text: string;

  constructor() {
    this.text = '';
    navigator.clipboard.readText().then((text) => {
      console.log('Pasted content: ', text);
      this.text = text;
    });
  }
}
