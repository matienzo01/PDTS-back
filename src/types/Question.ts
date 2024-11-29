export interface Question {
    label: string;
    typeId: number | null
    options: {valor: string}[]
    subQuestions?: Question[]
}