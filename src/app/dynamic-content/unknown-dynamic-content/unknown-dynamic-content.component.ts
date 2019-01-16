import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-unknown-dynamic-content',
  templateUrl: './unknown-dynamic-content.component.html',
  styleUrls: ['./unknown-dynamic-content.component.css']
})
export class UnknownDynamicContentComponent implements OnInit {
  @Input() loadingError: string;

  constructor() {}

  ngOnInit() {}
}
