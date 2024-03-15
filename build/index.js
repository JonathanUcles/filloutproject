var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
const port = 3000;
app.get('/', (req, res) => {
    res.send('hello world');
});
app.get('/:formId/filteredResponses', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //making assumption that filters=[{"id":"something","condition":"greater_than","value":"10"}] due to the JSON.stringify() before going in the url  
    // another way to handle /:formId/filteredResponses?filters[0][id]=&filters[0][condition]=&filters[0][value]=
    const formId = req.params.formId;
    const { filters } = req.query;
    function applyConditions(condition, dataValue, filterValue) {
        switch (condition) {
            case 'equals':
                //console.log(`${dataValue} === ${filterValue}`)
                return dataValue == filterValue;
            case 'does_not_equal':
                return dataValue !== filterValue;
            case 'greater_than':
                return dataValue > filterValue;
            case 'less_than':
                return dataValue < filterValue;
            default:
                return false; // no filters return true
        }
    }
    try {
        const filloutRequest = yield fetch(`https://api.fillout.com/v1/api/forms/${formId}/submissions`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${process.env.filloutToken}`
            }
        });
        const body = yield filloutRequest.json();
        //if filters isn't used  just return the api data
        if (filters === undefined) {
            //use return to not trigger the next res.json could aslo just do an else
            return res.json(body);
        }
        const decodedFilters = JSON.parse(decodeURIComponent(`${filters}`));
        let filteredSubmissionQuestions = [];
        body.responses.forEach(submission => submission.questions.forEach(question => {
            decodedFilters === null || decodedFilters === void 0 ? void 0 : decodedFilters.some(filter => {
                if (filter.id === question.id && applyConditions(filter.condition, question.value, filter.value)) {
                    filteredSubmissionQuestions.push(question);
                }
            });
        }));
        res.json({
            responses: {
                questions: filteredSubmissionQuestions,
                totalResponses: filteredSubmissionQuestions.length,
                pageCount: 1
            }
        });
    }
    catch (err) {
        res.status(500).json({
            err,
            message: 'internal server error',
            filters
        });
    }
}));
app.listen(port, () => {
    console.log(`Server Connected on ${port}`);
});
