import { GraphQLError } from "graphql"
import { Types } from "mongoose"
import { Filter } from "types/dateFilter.type"
import { periodHandler } from "./datehandler"



interface FilterOptions {
    startDate?: Date
    endDate?: Date
    targetField?: String  
}


export function dateFilterAggregationPipeline(restaurantId: string, filter: Filter, options?:FilterOptions) : Array<{[key:string]: {[key:string]: any}}>{
    let pipeline: Array<{[key: string]: {[key:string]: any}}> = []

    const targetField = options?.targetField? `${options?.targetField}`: "result"

    const filterGroupType = {
        [Filter.MONTHLY]: {'$month': '$createdAt' },
        [Filter.WEEKLY]: {'$week': '$createdAt' },
        [Filter.DAILY]: {'$dayOfYear': '$createdAt' }
    }

    
    // match by restaurantId
    pipeline.push({"$match":{"restaurantId":Types.ObjectId(restaurantId)}})
    
    // add groupKey and result custom fields
    pipeline.push({
        "$addFields": { 
            'date': { 'groupKey': filterGroupType[filter]}, 
            'result': 1 
        }
    })

    // group by result and init result field
    pipeline.push({
        '$group':  {
            '_id': '$date.groupKey', 
            'result': {
                '$sum': `$${targetField}`
            }, 
            'fullDate': {
                '$first': '$$ROOT.createdAt'
            }
        }
    })

    // clean output
    pipeline.push({
        "$project" : {
            '_id': 0, 
            'groupKey': '$_id', 
            'result': 1, 
            'fullDate': 1
        }
    })

    // sort output
    pipeline.push({ 
        "$sort" :  {
            'groupKey': 1
        }
    })
    
    return pipeline
}