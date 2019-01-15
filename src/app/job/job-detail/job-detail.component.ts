import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl, Validators, ValidationErrors } from '@angular/forms';
import { NotifierService } from 'angular-notifier';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Job } from '../job.model';

@Component({
  selector: 'app-job-detail',
  templateUrl: './job-detail.component.html',
  styleUrls: ['./job-detail.component.scss']
})
export class JobDetailComponent implements OnInit {

  private readonly notifier: NotifierService;

  loadingForm: boolean;
  sub: any;
  number: string;

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

  get jobNumber(): any { return this.jobForm.get('jobNumber'); }
  get ownerPhoneNumber(): any { return this.jobForm.get('ownerPhoneNumber'); }
  get ownerEmail(): any { return this.jobForm.get('ownerEmail'); }
  get ownerFirstName(): any { return this.jobForm.get('ownerFirstName'); }
  get ownerLastName(): any { return this.jobForm.get('ownerLastName'); }
  get ownerStreetAddress(): any { return this.jobForm.get('ownerStreetAddress'); }
  get ownerCity(): any { return this.jobForm.get('ownerCity'); }
  get ownerState(): any { return this.jobForm.get('ownerState'); }
  get ownerZipcode(): any { return this.jobForm.get('ownerZipcode'); }

  constructor(
    private http : HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    notifierService: NotifierService,
  ) {
    this.notifier = notifierService;
  }

  ngOnInit() {
    this.loadingForm = false;
    this.sub = this.route.params.subscribe(params => {
      this.number = params.number;
    });
    this.loadForm();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  loadForm() {
    this.loadingForm = true;
    this.http.get(`/api/jobs/${this.number}`).subscribe((res : any) => {
      this.loadingForm = false;
      if (!res.success) {
        this.notifier.notify('error', `Failed to retrieve Job. ${res.errors.join(' ')}`);
        this.jobForm.reset();
      } else {
        this.notifier.notify('success', 'Job retrieved successfully.');
        this.jobNumber.setValue(res.data.number);
        this.ownerPhoneNumber.setValue(res.data.owner.phoneNumber);
        this.ownerEmail.setValue(res.data.owner.email);
        this.ownerFirstName.setValue(res.data.owner.name.first);
        this.ownerLastName.setValue(res.data.owner.name.last);
        this.ownerStreetAddress.setValue(res.data.owner.address.street);
        this.ownerCity.setValue(res.data.owner.address.city);
        this.ownerState.setValue(res.data.owner.address.state);
        this.ownerZipcode.setValue(res.data.owner.address.zipcode);
      }
    }, (err: any) => {
      this.loadingForm = false;
      this.notifier.notify('error', `Failed to retrieve Job. ${err}`);
      this.jobForm.reset();
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

  updateJob() {
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
    this.http.put(`/api/jobs/${this.number}`, body).subscribe((res : any) => {
      this.loadingForm = false;
      if (!res.success) {
        this.notifier.notify('error', `Failed to update Job. ${res.errors.join(' ')}`);
      } else {
        this.notifier.notify('success', 'Job updated successfully.');
      }
    }, err => {
      this.loadingForm = false;
      this.notifier.notify('error', `Failed to update Job. ${err.message}`);
    });
  }

}
