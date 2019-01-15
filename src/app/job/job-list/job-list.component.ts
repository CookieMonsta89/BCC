import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl, Validators, ValidationErrors } from '@angular/forms';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { DataSource } from '@angular/cdk/table';
import { NotifierService } from 'angular-notifier';
import { Job } from '../job.model';

@Component({
  selector: 'app-job-list',
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.scss']
})
export class JobListComponent implements OnInit {

  private readonly notifier: NotifierService;
  dataSource = new MatTableDataSource<Job>();
  loadingTable: boolean;
  loadingForm: boolean;
  displayedColumns = [];
  private paginator: MatPaginator;
  private sort: MatSort;

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSourceAttributes();
  }

  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }

  setDataSourceAttributes() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  columnDefs = [
    {name: 'identifier', title: 'Job Identifier'},
    {name: 'owner.name.full', title: 'Owner Name'},
    {name: 'owner.address.full', title: 'Job Address'},
    {name: 'owner.phoneNumber', title: 'Owner Phone Number'},
    {name: 'owner.email', title: 'Owner Email'},
  ];

  jobForm = new FormGroup({
    jobNumber: new FormControl('', [Validators.required]),
    ownerPhoneNumber: new FormControl('', [Validators.required, Validators.pattern(/^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/)]),
    ownerEmail: new FormControl('', [Validators.required, Validators.email]),
    ownerFirstName: new FormControl('', [Validators.required]),
    ownerLastName: new FormControl('', [Validators.required]),
    ownerStreetAddress: new FormControl('', [Validators.required]),
    ownerCity: new FormControl('', [Validators.required]),
    ownerState: new FormControl('', [Validators.required]),
    ownerZipcode: new FormControl('', [Validators.required]),
  })

  constructor(
    private http : HttpClient,
    private router: Router,
    notifierService: NotifierService,
  ) {
    this.notifier = notifierService;
  }

  get jobNumber(): any { return this.jobForm.get('jobNumber'); }
  get ownerPhoneNumber(): any { return this.jobForm.get('ownerPhoneNumber'); }
  get ownerEmail(): any { return this.jobForm.get('ownerEmail'); }
  get ownerFirstName(): any { return this.jobForm.get('ownerFirstName'); }
  get ownerLastName(): any { return this.jobForm.get('ownerLastName'); }
  get ownerStreetAddress(): any { return this.jobForm.get('ownerStreetAddress'); }
  get ownerCity(): any { return this.jobForm.get('ownerCity'); }
  get ownerState(): any { return this.jobForm.get('ownerState'); }
  get ownerZipcode(): any { return this.jobForm.get('ownerZipcode'); }

  getProperty = (obj, path) => (
    path.split('.').reduce((o, p) => o && o[p], obj)
  )

  nestedFilterCheck(search, data, key) {
    if (typeof data[key] === 'object') {
      for (const k in data[key]) {
        if (data[key][k] !== null) {
          search = this.nestedFilterCheck(search, data[key], k);
        }
      }
    } else if (this.columnDefs.map(cd => cd.name.split('.')[cd.name.split('.').length - 1]).includes(key)) {
      search += data[key] + ' ';
    }
    return search;
  }

  ngOnInit() {
    this.displayedColumns = this.columnDefs.map(cd => cd.name);
    this.loadingTable = false;
    this.loadingForm = false;
    this.loadTable();
  }

  loadTable() {
    this.loadingTable = true;
    this.http.get('/api/jobs').subscribe((res : any) => {
      this.loadingTable = false;
      if (!res.success) {
        this.notifier.notify('error', `Failed to retrieve Jobs. ${res.errors.join(' ')}`);
      } else {
        this.notifier.notify('success', 'Jobs retrieved successfully.');
        this.dataSource = new MatTableDataSource(res.data);
        this.dataSource.filterPredicate = (data, filter: string)  => {
          const accumulator = (currentTerm, key) => {
            return this.nestedFilterCheck(currentTerm, data, key);
          };
          const dataStr = Object.keys(data).reduce(accumulator, '').toLowerCase();
          // Transform the filter by converting it to lowercase and removing whitespace.
          const transformedFilter = filter.trim().toLowerCase();
          return dataStr.indexOf(transformedFilter) !== -1;
        };
        this.dataSource.sortingDataAccessor = (obj, property) => this.getProperty(obj, property);
        this.dataSource.sort = this.sort;
      }
    }, (err: any) => {
      this.loadingTable = false;
      this.notifier.notify('error', `Failed to retrieve Jobs. ${err}`);
      this.dataSource = new MatTableDataSource([]);
    });
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  resetForm() {
    this.jobForm.reset();
  }

  createJob() {
    if(!this.jobForm.valid) {
      this.notifier.notify('warning', 'The Job form is not valid. Please try again.');
      this.validateAllFormFields(this.jobForm);
      return;
    }

    let {
      jobNumber,
      ownerPhoneNumber,
      ownerEmail,
      ownerFirstName,
      ownerLastName,
      ownerStreetAddress,
      ownerCity,
      ownerState,
      ownerZipcode
    } = this.jobForm.getRawValue();

    const body = {
      number: jobNumber,
      owner: {
        name: {
          first: ownerFirstName,
          last: ownerLastName
        },
        email: ownerEmail,
        phoneNumber: ownerPhoneNumber,
        address: {
          street: ownerStreetAddress,
          city: ownerCity,
          state: ownerState,
          zipcode: ownerZipcode
        }
      }
    }
    this.loadingForm = true;
    this.http.post('/api/jobs', body).subscribe((res : any) => {
      this.loadingForm = false;
      if (!res.success) {
        this.notifier.notify('error', `Failed to create Job. ${res.errors.join(' ')}`);
      } else {
        this.notifier.notify('success', 'Job created successfully.');
        this.loadTable();
        this.jobForm.reset();
      }
    }, err => {
      this.loadingForm = false;
      this.notifier.notify('error', `Failed to create Job. ${err.message}`);
    });
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  goToDetails(row) {
    this.router.navigate([`/job/detail/${row.number}`]);
  }

}
