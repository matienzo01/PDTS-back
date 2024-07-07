
export interface CustomErrorInterface extends Error {
    status: number;
    questions?: any
}


export class CustomError extends Error implements CustomErrorInterface {
    public status: number;
    public questions: any
    constructor(message: string, code: number, questions?: any) {
        super(message);
        this.status = code;
        this.questions = questions
        Object.setPrototypeOf(this, CustomError.prototype);
    }
}