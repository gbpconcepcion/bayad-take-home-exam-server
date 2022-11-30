This is my submission for the technical exam

it is a web application for a digital wallet system using MERNG stack (mongodb, express, react, node, graphql)

clone both into separate folders

open a terminal for each folder

type `npm install` on both to install dependencies


BACKEND

in order to start the server head into the cloned bayad-take-home-exam-server repository and type `npm run dev` in one of the terminals.

the backend will be hosted in localhost:5000

the graph layer that hosts the web api is located at localhost:5000/graphql

open your browser and enter localhost:5000/graphql on the url

graphiql is implemented and the testing of the web api can be done localhost:5000/graphql, use the GRAPHQLTEST.txt to use the test cases


FRONTEND

in order to start the client head into the cloned bayad-take-home-exam-client repository and type `npm start` in the other terminal

the frontend will be hosted in localhost:3000

the Apollo Client wraps the entire app and is the one that communicates with the graph layer of localhost:5000/graphql

The Wallets tab shows all the Wallet Users in a table. clicking on a particular row routes you to the AccountViewer of that specific user

The Account Viewer shows the information of the Wallet User along including the balance. The transaction button reveals the transaction history
of the wallet user. The cash-in and debit buttons perform their respective mutations given the value of the inputbox for the amount.

The Register tab creates an new Wallet User

The Login tab authenticates wallet users
