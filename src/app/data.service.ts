import { Injectable } from '@angular/core';
import { ILink } from './models/link.interface';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class DataService {
  private boardLinks = new BehaviorSubject<ILink[]>( [] );
  links = this.boardLinks.asObservable();


  constructor() {
    this.boardLinks.value.push({ key: 'sell', link: 'http://boards.nexustk.com/MarketS', text: 'Market (Sell)' } );
    this.boardLinks.value.push({ key: 'buy', link: 'http://boards.nexustk.com/MarketB', text: 'Market (Buy)' } );
    this.boardLinks.value.push({ key: 'commevents', link: 'http://boards.nexustk.com/ComEvents', text: 'Community Events' } );
    this.boardLinks.value.push({ key: 'hunt', link: 'http://boards.nexustk.com/Hunting', text: 'Hunting' } );
    this.boardLinks.value.push({ key: 'carnage', link: 'http://boards.nexustk.com/Carnage', text: 'Carnage Schedule' } );
    this.boardLinks.value.push({ key: 'comm', link: 'http://boards.nexustk.com/Community', text: 'Community' } );
    this.boardLinks.value.push({ key: 'dreams', link: 'http://boards.nexustk.com/Dreams', text: 'Dreams' } );
    this.boardLinks.value.push({ key: 'dweaver', link: 'http://boards.nexustk.com/DreamWeaver', text: 'Dream Weaver' } );
    this.boardLinks.value.push({ key: 'poems', link: 'http://boards.nexustk.com/Poetry', text: 'Poetry' } );
    this.boardLinks.value.push({ key: 'story', link: 'http://boards.nexustk.com/Story', text: 'Story Contest' } );
    this.boardLinks.value.push({ key: 'cotw', link: 'http://boards.nexustk.com/Chronicles', text: 'Chronicles of the Winds' });
  }

}
