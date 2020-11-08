export default class mockResponse {
    public statusCode: number;

    constructor() {

    }

    status = (statusCode: number) => {
        this.statusCode = statusCode;
        return this;
    }

    end = () => {
        //Stubbed
    }
}