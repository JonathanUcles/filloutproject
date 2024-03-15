export type FilterClauseType = {
    id: string;
    condition: 'equals' | 'does_not_equal' | 'greater_than' | 'less_than';
    value: number | string;
}
export type ResponseFiltersType = ResponseFilter[];
export type Questions = {
    id:string;
    name:string;
    type:string;
    value:string | number;
}
export type FormSubmissions= {
    submissionId:string;
    submissionTime:string;
    astUpdatedAt:string;
    questions:Questions[];
    calculations:[];
    urlParameters:[];
    quiz:{};
    documents:[]
}
export type APIResponseData = {
    responses:FormSubmissions[];
    totalResponses:number;
    pageCount:number;
}
export type Condition= 'equals' | 'does_not_equal' | 'greater_than' | 'less_than';
