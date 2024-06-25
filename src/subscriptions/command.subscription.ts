import { GraphQLID, GraphQLString } from "graphql"
import { withFilter } from "graphql-subscriptions"
import { pubsub } from "index"
import { clientCommandUpdateType, restaurantCommandUpdateType } from "types/command.type"



export default {
    LatestCommand: {
        subscribe: withFilter(
            () => pubsub.asyncIterator(['COMMAND_CREATED']),
            (payload, variables) =>{                
                return String(payload.restaurantId) === variables.restaurantId
            }    
        ),
        type: GraphQLString,
        args: {
            restaurantId: {type: GraphQLID}
        }
    },

    RestaurantCommmandStatusUpdate:{
        subscribe: withFilter(
            () => pubsub.asyncIterator(['RESTAURANT_COMMAND_STATUS_UPDATED']),
            (payload, variables) => {       
                return payload.CommmandStatusUpdate.restaurantId === variables.restaurantId
            }
        ),
        type: restaurantCommandUpdateType,
        args: {
            restaurantId: {type: GraphQLID},
            status: {type: GraphQLString}
        },
    },

    ClientCommmandStatusUpdate:{
        subscribe: withFilter(
            () => pubsub.asyncIterator(['CLIENT_COMMAND_STATUS_UPDATED']),
            (payload, variables) => {                    
                return  payload.clientId === variables.clientId && payload.status === variables.status  
            }
        ),
        type: clientCommandUpdateType,
        args: {
            clientId: {type: GraphQLID},
            status: {type: GraphQLString}
        }

    }
}
