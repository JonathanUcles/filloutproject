import express, {Application,Request,Response} from 'express'
import dotenv from 'dotenv'
import { FilterClauseType, Questions, Condition, APIResponseData } from '../types.js'
dotenv.config()

const app:Application = express()
const port =3000;
app.get('/',(req:Request,res:Response)=>{
    res.send('hello world')
})
app.get('/:formId/filteredResponses', async (req:Request,res:Response)=>{
    //making assumption that filters=[{"id":"something","condition":"greater_than","value":"10"}] due to the JSON.stringify() before going in the url  
    // another way to handle /:formId/filteredResponses?filters[0][id]=&filters[0][condition]=&filters[0][value]=
    const formId = req.params.formId
    const { filters }  = req.query 
    

    function applyConditions(condition:Condition, dataValue:string | number, filterValue:string | number ){
        switch(condition){
            case 'equals':
                //console.log(`${dataValue} === ${filterValue}`)
                return  dataValue == filterValue 
            case 'does_not_equal':
                return dataValue !== filterValue
            case 'greater_than':
                return dataValue > filterValue
            case 'less_than':
                return dataValue < filterValue
            default:
                return false;// no filters return true

        }

    }
    try{
        const filloutRequest = await fetch(`https://api.fillout.com/v1/api/forms/${formId}/submissions`,{        
            method:"GET",
            headers:{
                Authorization: `Bearer ${process.env.filloutToken}`
            }
        })
        const body:APIResponseData = await filloutRequest.json()
        //if filters isn't used  just return the api data
        if(filters === undefined){
            //use return to not trigger the next res.json could aslo just do an else
            return res.json(body)

        }
        const decodedFilters:FilterClauseType[] = JSON.parse(decodeURIComponent(`${filters}`))
        

        let filteredSubmissionQuestions:Questions[] = []
        body.responses.forEach(submission=>
            submission.questions.forEach(question =>{
                decodedFilters?.some(filter =>{
                    if(  filter.id === question.id && applyConditions(filter.condition, question.value, filter.value)){
                        filteredSubmissionQuestions.push(question)
                    }
                })
            
            
            })
            )
                      
        res.json({ 
            responses:{
                questions:filteredSubmissionQuestions,
                totalResponses: filteredSubmissionQuestions.length,
                pageCount:1
            }
        })

    }catch(err){
        res.status(500).json({
            err,
            message:'internal server error',
            filters
        })


    }
    
})
app.listen(port,()=>{
    console.log(`Server Connected on ${port}`)
})