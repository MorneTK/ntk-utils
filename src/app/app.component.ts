import { Component, OnInit } from '@angular/core';
import { DataService } from './data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  searching: boolean = false;
  results: Array<string> = [];

  constructor( private _data: DataService ) {}

  ngOnInit() {
    this._data.searching.subscribe(( res: boolean ) => this.searching = res );
  }
}
