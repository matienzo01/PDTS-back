export interface CustomErrorInterface extends Error {
    status: number;
}


export class CustomError extends Error implements CustomErrorInterface {
    public status: number;
    constructor(message: string, code: number) {
        super(message);
        this.status = code;
        Object.setPrototypeOf(this, CustomError.prototype);
      }
}