export interface Job {
  identifier: string;
  owner: {
    name: {
      first: string;
      last: string;
    },
    phoneNumber: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipcode: number;
    }
    email: string;
  }
}
