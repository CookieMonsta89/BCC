import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl, Validators, ValidationErrors } from '@angular/forms';
import { MatTableDataSource, MatSort } from '@angular/material';
import { DataSource } from '@angular/cdk/table';
import { NotifierService } from 'angular-notifier';

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
  selector: 'app-job-list',
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.scss']
})
export class JobListComponent implements OnInit {

  private readonly notifier: NotifierService;
  dataSource;
  loading: boolean;
  displayedColumns = [];
  @ViewChild(MatSort) sort: MatSort;
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

  ngOnInit() {
    this.displayedColumns = this.columnDefs.map(cd => cd.name);
    this.loading = false;
    this.loadTable();
  }

  loadTable() {
    this.loading = true;
    this.http.get('/api/jobs').subscribe((res : any) => {
      this.loading = false;
      if (!res.success) {
        this.notifier.notify('error', `Failed to retrieve Jobs. ${res.errors.join(' ')}`);
      } else {
        this.notifier.notify('success', 'Jobs retrieved successfully.');
        this.dataSource = new MatTableDataSource(res.data);
        this.dataSource.sortingDataAccessor = (obj, property) => this.getProperty(obj, property);
        this.dataSource.sort = this.sort;
      }
    }, (err: any) => {
      this.loading = false;
      this.notifier.notify('error', `Failed to retrieve Jobs. ${err}`);
      this.dataSource = new MatTableDataSource([]);
      this.dataSource.sort = this.sort;
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
    this.loading = true;
    this.http.post('/api/jobs', body).subscribe((res : any) => {
      this.loading = false;
      if (!res.success) {
        this.notifier.notify('error', `Failed to create Job. ${res.errors.join(' ')}`);
      } else {
        this.notifier.notify('success', 'Job created successfully.');
        this.loadTable();
        this.jobForm.reset();
      }
    }, err => {
      this.loading = false;
      this.notifier.notify('error', `Failed to create Job. ${err.message}`);
    });
  }

}
