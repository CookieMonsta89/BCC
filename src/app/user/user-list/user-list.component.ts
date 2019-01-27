import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl, Validators, ValidationErrors } from '@angular/forms';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { DataSource } from '@angular/cdk/table';
import { NotifierService } from 'angular-notifier';
import { User } from '../user.model';

import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {

  private readonly notifier: NotifierService;
  dataSource = new MatTableDataSource<User>();
  loadingTable: boolean;
  loadingForm: boolean;
  displayedColumns = [];
  userId: string;
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

  columnDefs = [
    {name: 'fullname', title: 'Full Name'},
    {name: 'email', title: 'Email'},
    {name: 'role', title: 'Role'},
  ];

  availableRoles: string[] = ['admin', 'employee', 'customer'];

  userForm = new FormGroup({
    fullname: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    repeatPassword: new FormControl('', [Validators.required, this.passwordsMatchValidator]),
    role: new FormControl('', [Validators.required]),
  });

  constructor(
    private http : HttpClient,
    private router: Router,
    notifierService: NotifierService,
    private authService: AuthService,
  ) {
    this.notifier = notifierService;
  }

  setDataSourceAttributes() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  passwordsMatchValidator(control: FormControl): ValidationErrors {
    let password = control.root.get('password');
    return password && control.value !== password.value ? {
      passwordMatch: true
    }: null;
  }

  get fullname(): any { return this.userForm.get('fullname'); }
  get email(): any { return this.userForm.get('email'); }
  get password(): any { return this.userForm.get('password'); }
  get repeatPassword(): any { return this.userForm.get('repeatPassword'); }
  get role(): any { return this.userForm.get('role'); }

  createOrUpdateUser() {
    let {
      fullname,
      email,
      password,
      repeatPassword,
      role,
    } = this.userForm.getRawValue();

    if(!this.userForm.valid && !(this.userId && !password && !repeatPassword)) {
      this.notifier.notify('warning', 'User form is not valid. Please try again.');
      this.validateAllFormFields(this.userForm);
      return;
    }

    this.loadingForm = true;
    if (!this.userId) {
      this.authService.createUser(
        fullname,
        email,
        password,
        repeatPassword,
        role,
      ).subscribe(res => {
        this.loadingForm = false;
        if (!res.success) {
          if (res.errors) {
            this.notifier.notify('error', `Failed to create User. ${res.errors.join(' ')}`);
          } else {
            this.notifier.notify('error', 'Failed to create User.');
          }
        } else {
          this.notifier.notify('success', 'User created successfully.');
          this.loadTable();
          this.userForm.reset();
        }
      }, err => {
        this.loadingForm = false;
        this.notifier.notify('error', `Failed to create User. ${err.message}`);
      });
    } else {
      this.authService.updateUser(
        this.userId,
        fullname,
        email,
        password,
        repeatPassword,
        role,
      ).subscribe(res => {
        this.loadingForm = false;
        if (!res.success) {
          if (res.errors) {
            this.notifier.notify('error', `Failed to update User. ${res.errors.join(' ')}`);
          } else {
            this.notifier.notify('error', 'Failed to update User.');
          }
        } else {
          this.notifier.notify('success', 'User updated successfully.');
          this.loadTable();
          this.userForm.reset();
          this.userId = null;
        }
      }, err => {
        this.loadingForm = false;
        this.notifier.notify('error', `Failed to update User. ${err.message}`);
      });
    }
  }

  deleteUser(row) {
    this.loadingTable = true;
    this.authService.deleteUser(row._id).subscribe(res => {
      this.loadingTable = false;
      if (!res.success) {
        if (res.errors) {
          this.notifier.notify('error', `Failed to delete User. ${res.errors.join(' ')}`);
        } else {
          this.notifier.notify('error', 'Failed to delete User.');
        }
      } else {
        this.notifier.notify('success', 'User deleted successfully.');
        this.loadTable();
      }
    }, err => {
      this.loadingTable = false;
      this.notifier.notify('error', `Failed to delete User. ${err.message}`);
    });
  }

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
    this.displayedColumns.push('updateButtonColumn');
    this.displayedColumns.push('deleteButtonColumn');
    this.loadingTable = false;
    this.loadingForm = false;
    this.loadTable();
  }

  loadTable() {
    this.loadingTable = true;
    this.http.get('/api/users').subscribe((res : any) => {
      this.loadingTable = false;
      if (!res.success) {
        this.notifier.notify('error', `Failed to retrieve Users. ${res.errors.join(' ')}`);
      } else {
        this.notifier.notify('success', 'Users retrieved successfully.');
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
      this.notifier.notify('error', `Failed to retrieve Users. ${err}`);
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
    this.userForm.reset();
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  createOrUpdateText() {
    return (this.userId) ? 'Update User' : 'Create User';
  }

  goToDetails(row) {
    this.loadingForm = true;
    this.userId = row._id;
    this.http.get(`/api/users/${this.userId}`).subscribe((res : any) => {
      this.loadingForm = false;
      if (!res.success) {
        if (res.errors) {
          this.notifier.notify('error', `Failed to retrieve User. ${res.errors.join(' ')}`);
          this.userId = null;
        } else {
          this.notifier.notify('error', 'Failed to retrieve User.');
          this.userId = null;
        }
      } else {
        this.notifier.notify('success', 'User retrieved successfully.');
        this.fullname.setValue(res.data.fullname);
        this.email.setValue(res.data.email);
        this.role.setValue(res.data.role);
        this.password.setValue('');
        this.repeatPassword.setValue('');
      }
    }, err => {
      this.loadingForm = false;
      this.notifier.notify('error', `Failed to retrieve User. ${err.message}`);
      this.userId = null;
    });
  }

}
