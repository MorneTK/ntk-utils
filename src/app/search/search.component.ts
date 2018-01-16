import { Component, OnInit } from '@angular/core';
import { ILink } from '../models/link.interface';
import { DataService } from '../data.service';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  board: string = '';
  terms: string[] = [];
  links: ILink[] = [];
  searching: boolean = false;
  longWait: boolean = false;
  currentBoardLink: string;
  currentBoardText: string;
  noResults: boolean = false;
  results: string[] = [];
  totalLinks: number;
  searchText: string = 'Searching';
  searchTextIteration: number = 0;
  searchTimerCycles: number = 0;

  constructor(private _data: DataService, private _http: HttpClient ) {}

  ngOnInit() {
    this._data.links.subscribe(( res: Array<ILink> ) => this.links = res );
  }

  onBoardChange( value: string ) {
    this.board = value;

    const currentlySelected = this.links.filter(( link ) => link.key === this.board )[0];

    if ( currentlySelected ) {
      this.currentBoardLink = currentlySelected.link;
      this.currentBoardText = currentlySelected.text
    }
  }

  termsUpdated( value: string ) {
    const rawTerms = value.replace( /\n/g, '' ).split( /,/ );
    this.terms = rawTerms.map(( term ) => term.trim() ).filter(( term ) => term.length > 0 );
  }

  searchingTick = () => {
    this.searchTextIteration++;
    if ( this.searchTextIteration === 4 ) {
      this.searchTimerCycles++;
      this.searchTextIteration = 0;
      this.searchText = 'Searching';

      if ( this.searchTimerCycles >= 6 ) {
        this.longWait = true;
      }
    } else {
      this.searchText += '.';
    }
  }

  doSearch() {
    this.results = [];
    this.noResults = false;
    this.longWait  = false;
    this.searching = true;
    const interval = setInterval( this.searchingTick, 500 );

    const endpoint = `/api/search?baseLink=${this.currentBoardLink}&terms=${ this.terms.join( ',' )}`;
    this._http.get( endpoint ).subscribe(( data: any ) => {
      this.searching = false;
      this.longWait  = false;
      clearInterval( interval );
      this.searchText = 'Searching';

      this.results    = data.uLinks;
      this.totalLinks = data.totalLinks;
      this.noResults  = data.uLinks.length === 0;
    });
  }

  buttonDisabled(): string {
    if ( this.searching ) { return 'disabled'; }
    if ( this.board.length === 0 ) { return 'disabled'; }
    if ( this.terms.length === 0 ) { return 'disabled'; }
    return '';
  }

  resultCount(): string {
    if ( this.results.length === 0 ) { return ''; }
    return ` (${this.results.length})`;
  }

  removeLink( idx ): boolean {
    this.results.splice( idx, 1 );
    return false;
  }
}
