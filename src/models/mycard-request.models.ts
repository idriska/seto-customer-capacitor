export class MyCardRequest {
    number: string;
    exp_month: string;
    exp_year: string;
    cvc: string;
    name: string;
    title: string;
    email: string;

    constructor() {
        this.title = "personal";
    }
}