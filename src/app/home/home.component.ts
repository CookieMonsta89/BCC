import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource, MatSort } from '@angular/material';
import { DataSource } from '@angular/cdk/table';

export interface Job {
  identifier: string;
  owner: {
    name: {
      first: string;
      last: string;
    },
  }
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  dataSource;
  displayedColumns = [];
  @ViewChild(MatSort) sort: MatSort;
  columnDefs = [
    {name: 'identifier', title: 'Job Identifier'},
    {name: 'owner.name.full', title: 'Owner Name'},
    {name: 'owner.address.full', title: 'Job Address'},
    {name: 'owner.phoneNumber', title: 'Owner Phone Number'},
    {name: 'owner.email', title: 'Owner Email'},
  ];

  constructor(private http : HttpClient) { }

  getProperty = (obj, path) => (
    path.split('.').reduce((o, p) => o && o[p], obj)
  )

  ngOnInit() {
    this.displayedColumns = this.columnDefs.map(cd => cd.name);
    this.http.get('/api/jobs').subscribe((data : any) => {
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.sortingDataAccessor = (obj, property) => this.getProperty(obj, property);
      this.dataSource.sort = this.sort;
    }, (err: any) => {
      this.dataSource = new MatTableDataSource([]);
      this.dataSource.sort = this.sort;
    });
  }

}
