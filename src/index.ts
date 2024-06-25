import { ApolloServer, ExpressContext } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer, ApolloServerPluginLandingPageDisabled, ApolloServerPluginLandingPageGraphQLPlayground, Config } from 'apollo-server-core';
import http from 'http';

import  { WebSocketServer } from "ws"
import { useServer } from "graphql-ws/lib/use/ws"
import { PubSub } from 'graphql-subscriptions';

import app from 'config/express';
import { port, serverUrl } from 'config/vars';
import schema from './config/graphql';

import connect from 'config/mongoose';

connect();

export const pubsub = new PubSub()


async function startApolloServer(){
  const httpServer = http.createServer(app);

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  const serverCleanup = useServer({ schema }, wsServer);

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginLandingPageGraphQLPlayground({}),
      ApolloServerPluginLandingPageDisabled(),
      {
        async serverWillStart() {          
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
    context: ({ req }) => req

  });

  await server.start();
  server.applyMiddleware({
    app,
    path: '/graphql',
    cors:{
      credentials: true,
      // allowedHeaders: ['Authorization']
    }

  });
  

  await new Promise<void>(resolve => httpServer.listen({ port: port }, resolve));
  console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`);
}

startApolloServer()