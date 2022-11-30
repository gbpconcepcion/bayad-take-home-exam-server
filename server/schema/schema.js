const mongoose = require('mongoose');
const {ObjectId} = require('mongodb')
const bcrypt = require('bcryptjs')
require('dotenv').config();
const jwt = require('jsonwebtoken')
const secret = process.env.SECRET_KEY

const {
    GraphQLObjectType, 
    GraphQLID, 
    GraphQLString, 
    GraphQLFloat, 
    GraphQLBoolean,
    GraphQLList, 
    GraphQLSchema,
    GraphQLNonNull,
    GraphQLInt,
    GraphQLInputObjectType
} = require('graphql');

//imports mongoose models for reference
const WalletUser = require('../Models/WalletUser');
const TransactionClass = require('../Models/TransactionClass');
const Transaction = require('../Models/Transaction');
const Response = require('../Models/Response')

//unused input type
const TransactionTypeInput = new GraphQLInputObjectType({
    name: 'TransactionInput',
    fields: {
        id: {type: GraphQLID},
        transactor: {type: GraphQLID},
        transaction_class: {type:GraphQLID}
    }
})


//response of all mutations
const ResponseType = new GraphQLObjectType({
    name: 'Response',
    //returns an http code, code label, and message that can be used ubiquitously
    fields: {
        response_code: {type:GraphQLInt},
        response_label: {type:GraphQLString},
        response_message: {type:GraphQLString}
    }
})


//graphql object type that represents the mongoose schema object of Transaction
const TransactionType = new GraphQLObjectType({
    name: 'Transaction',
    //fields map the attributes of Transaction found in the definition of mongoose models but is not directly linked to them
    fields:{
        id: {type: GraphQLID},
        date: {type: GraphQLString},
        amount: {type: GraphQLFloat},
        _deleted: {type: GraphQLBoolean},
        //transactor and transaction_class will be used to function similarly as foreign keys to WalletUser and Transaction Class respectively
        transactor: {type: GraphQLID},
        transaction_class: {type: GraphQLID},
        status: {type: GraphQLInt}
    }
});

//graphql object type that represents the mongoose schema object of WalletUser
const WalletUserType = new GraphQLObjectType({
    name: 'WalletUser',
    //fields map the attributes of WalletUser found in the definition of mongoose models but is not directly linked to them
    fields: {
        id: {type: GraphQLID},
        username: {type: GraphQLString},
        password: {type: GraphQLString},
        firstname: {type: GraphQLString},
        lastname: {type: GraphQLString},
        balance: {type: GraphQLFloat},
        _deleted: {type: GraphQLBoolean},
        token: {type: GraphQLString},
        //acts as a collection of the Model Transactions but only stores their id's
        history: {
            type: new GraphQLList(TransactionType),
            resolve(parent, args){
                return Transaction.findById(parent.id)
            }            
        }
    }
});

//graphql object type that represents the mongoose schema object of TransactionClass
const TransactionClassType = new GraphQLObjectType({
    name: 'TransactionClassType',
    //fields map the attributes of Transaction Class found in the definition of mongoose models but is not directly linked to them
    fields: {
        id: {type: GraphQLID},
        type_definition: {type: GraphQLString},
        _deleted: {type: GraphQLBoolean},
        //acts as a collection of the Model Transactions but only stores their id's
        classed_transactions: {
            type: TransactionType,
            resolve(parent, args){
                return Transaction.findById(parent.id)
            }            
        }
    }
});

//unused function that would help queries with projection of children documents
const transactionsById = transactionIds => {
    return Transaction.find({_id: {$in: {transactionIds}}})
        .then(transactions =>{
            return transactions.map(transaction => {
                return{
                    ...transaction._doc, _id: transaction._id, 
                    transaction_date: new Date(transaction._doc.transaction_date).toISOString(),
                    transactor: walletUser.bind(this, transaction.transactor),
                    transaction_type: transactionType.bind(this, transaction.transaction_type),

                };
            })
        })
        .catch(err => {
            throw err
        })
}


//graphql object type that represents the queries or the get operations
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        //gets a single wallet user given an ID
        wallet_user: {
            //expected type is the expected return type which is a WalletUserType declared earlier as a GraphQLObjectType
            //expected args is an ID since the query should return a specific instance
            type: WalletUserType,
            args: {id: {type: GraphQLID} },

            //resolver
            resolve(parent, args){
                console.log('test2')

                //returns the an exact match using the primary key (id) as reference, null otherwise
                return WalletUser.findById(args.id)
                    .then(result => {
                        console.log(result)
                        return result
                    })
                    .catch(err => {throw err})
            }
        },

        //gets all wallet users
        wallet_users: {
            //expected type is the expected return type which is a WalletUserType declared earlier as a GraphQLObjectType
            //expected args is an ID since the query should return a specific instance
            type: new GraphQLList(WalletUserType),
            resolve(parent, args){
                //returns all users found in the DB
                return WalletUser.find()
            }
        },

        //gets all the transactions of a wallet user using the transactor attribute of the Transaction object as reference
        wallet_user_history: {
            //expected type is the expected return type which is a TransactionType declared earlier as a GraphQLObjectType
            //expected args is an ID since the query should return a specific instance.
            type: new GraphQLList(TransactionType),
            args: {id: {type: GraphQLID} },
            resolve(parent, args){
                console.log('test1')
                //the id in the args is used to filter the list using a foreign key (transactor) of the object Transaction
                //which is a reference to a WalletUser
                return Transaction.find({transactor:ObjectId(args.id)})
                    .then(result => {
                        console.log(result)
                        return result
                    })
                    .catch(err => {throw err})
            }
        },
        
        //gets a single transaction class given an ID
        transaction_class: {
            //expected type is the expected return type which is a TransactionClass declared earlier as a GraphQLObjectType
            //expected args is an ID since the query should return a specific instance
            type: TransactionClassType,
            args: {id: {type: GraphQLID} },
            resolve(parent, args){
                //returns the an exact match using the primary key (id) as reference, null otherwise
                return TransactionClass.findById(args.id)
            }
        },

        //gets all transaction classes
        transaction_classes: {
            type: new GraphQLList(TransactionClassType),
            args: {id: {type: GraphQLID} },
            resolve(parent, args){
                //returns the whole list of transaction classes
                return TransactionClass.find();
            }
        },

        //gets all transactions of a class using the transaction type attribute of the Transaction object as reference
        transaction_class_transactions: {
          //expected type is the expected return type which is a TransactionType declared earlier as a GraphQLObjectType
            //expected args is an ID since the query should return a specific instance.
            type: new GraphQLList(TransactionType),
            args: {id: {type: GraphQLID} },
            resolve(parent, args){
                console.log('test')
                //the id in the args is used to filter the list using a foreign key (transaction_type) of the object Transaction
                //which is a reference to a TransactionClass
                return Transaction.find({transaction_type:ObjectId(args.id)})
                    .then(transactions => {
                        console.log(transactions)
                    })
                    .catch(err => {throw err})
            }
        },

        //gets a single transaction using an ID
        transaction: {
          //expected type is the expected return type which is a TransactionType declared earlier as a GraphQLObjectType
            //expected args is an ID since the query should return a specific instance.
            type: TransactionType,
            args: {id: {type: GraphQLID} },
            resolve(parent, args){
                //returns the an exact match using the primary key (id) as reference, null otherwise
                return Transaction.findById(args.id)
            }
        },

        //gets all transactions
        transactions: {
            type: new GraphQLList(TransactionType),
            args: {id: {type: GraphQLID} },
            resolve(parent, args){
                //returns the whole list of transactions
                return Transaction.find()
            }
        }
    }
});


//a list of all mutations made available to the graph layer. these are the create and update operations
const mutation = new GraphQLObjectType({
    name: 'RootMutationType',
    fields: {
        //adds a wallet user (register)
        addWalletUser: {
            //expected type is a response type in order to secure sensitive information like ids
            //argument only takes the 4 string attributes of WalletUser since _delete and balance have a default value upon object initialization
            type: ResponseType,
            args: {
                username: {type: new GraphQLNonNull(GraphQLString)},
                password: {type: new GraphQLNonNull(GraphQLString)},
                firstname: {type: new GraphQLNonNull(GraphQLString)},
                lastname: {type: new GraphQLNonNull(GraphQLString)},
            },
            async resolve(parent, args){
                //hashes password
                var pass = await bcrypt.hash(args.password, 12);
                console.log(pass)

                //creates an instance of the mongoose model WalletUser
                const wallet_user = new WalletUser({
                    username: args.username,
                    password: pass,
                    firstname: args.firstname,
                    lastname: args.lastname

                })

                //saves the new instance of user in the mongodb cloud
                return wallet_user
                    .save()
                    .then(result => {
                        console.log(result)

                        //creates a json web token and attaches it to the return type Response to be fed to the client side
                        const token = jwt.sign({
                            id: result.id,
                            username: result.username,
                        }, secret, {expiresIn: '1h'})

                        
                //returns success along with the jwt token
                        return new Response({
                            response_message: token,
                        })
                    })
                    .catch(err => {
                        throw err;
                    })
            }
        },
        
        newAdminPassword: {
            //was used in order to hash the passwords of older wallet users to be tested for other mutations
            //expected type is a response type in order to secure sensitive information like ids
            //since this was used to update wallet users password the argument used is id and a new passsword
            type: ResponseType,
            args: {
                id: {type: new GraphQLNonNull(GraphQLString)},
                new_password: {type: new GraphQLNonNull(GraphQLString)},
            },
            async resolve(parent, args){
                var pass = await bcrypt.hash(args.new_password, 12);
                console.log(pass)

                //wallet user is checekd for validity and retrieved to be updated
                const wallet_user = await WalletUser.findById(args.id)

                console.log(wallet_user)

                if(!wallet_user)
                {
                    throw new Response({
                        response_code: 404,
                        response_label: "Bad Request",
                    })
                }
                else
                {
                    wallet_user.password = pass
                }

                console.log(wallet_user)


                 return wallet_user
                    .save()
                    .then(result => {
                        console.log(result)

                        const token = jwt.sign({
                            id: result.id,
                            username: result.username,
                        }, secret, {expiresIn: '1h'})

                        
                    //returns success along with the jwt token
                        return new Response({
                            response_message: token,
                        })
                    })
                    .catch(err => {
                        throw err;
                    })
            }
        },
        //login mutation
        loginWalletUser: {
            //expected type is a response type in order to secure sensitive information like ids
            //uses username and password as arguments since those two will be checked for authentication
            type: ResponseType,
            args: {
                username: {type: new GraphQLNonNull(GraphQLString)},
                password: {type: new GraphQLNonNull(GraphQLString)},
            },
            async resolve(parent, args){
                var pass = await bcrypt.hash(args.password, 12);
                console.log(pass)

                //check if the username exists within the wallet users inside mongodb
                const wallet_user = await WalletUser.findOne({username: args.username})

                console.log(wallet_user)

                //returns an unauthorized if username does not exist
                if(!wallet_user)
                {
                    throw new Response({
                        response_code: 401,
                        response_label: "Unauthorized",
                        response_message: `${args.username} is not a valid User`
                    })
                }

                console.log(args.password)
                console.log(wallet_user.password)
                console.log(args.password == wallet_user.password)

                //checks if the hashed password and the inputed password are the same
                const match = await bcrypt.compare(args.password, wallet_user.password)

                console.log(match)

                //if the passwords do not match, mutation returns an unauthorized
                if(!match)
                {
                     throw new Response({
                        response_code: 401,
                        response_label: "Unauthorized",
                        response_message: `Password is Invalid`
                    })                   
                }


                //creates a new jwt token and attaches it to the success response to be fed to the client
                const token = jwt.sign({
                        id: wallet_user.id,
                        username: wallet_user.username,
                    }, secret, {expiresIn: '1h'})


                //returns success along with the jwt token
                return new Response({
                    response_message: token
                })
            }
        },
        //adds a transaction class
        addTransactionClass: {
            //expected type is a response type in order to secure sensitive information like ids
            //expected argument is the type_definition in order to define one transaction class from another
            type: ResponseType,
            args: {
                type_definition: {type: new GraphQLNonNull(GraphQLString)},
            },
            resolve(parent, args){
                //createsd a new instance of a Transaction Class
                const transaction_class = new TransactionClass({
                    type_definition: args.type_definition,

                })

                //saves newly created transaction class
                return transaction_class
                    .save()
                    .then(result => {

                        //returns a success Response along with the type_definition of the newly created transaction class
                        return new Response({
                            response_message: `A new Transaction Class ${args.type_definition} has been created`,
                        })
                    })
                    .catch(err => {
                        throw err;
                    })
            }
        },
        //creates a transaction and links the transaction to the WalletUser using the given id as reference. WalletUser's balance is update with the amount
        cashIn: {
            //expected type is a response type in order to secure sensitive information like ids
            //mutation takes only the amount and the id of the transactor
            type: ResponseType,
            args: {
                amount: {type: GraphQLFloat},
                transactor: {type: GraphQLID}
            },
            resolve(parent, args){

                //create new transaction based on args
                //transaction_type is already declared at the start since there are only 2 types of transaction mutations
                const transaction = new Transaction({
                    transaction_date: new Date().toISOString(),
                    amount: args.amount,
                    transactor: args.transactor,
                    transaction_type: "6385d4f5ced0c4a442fe8cad",
                    status: 1

                })

                //save newly created transaction in the db if successful
                return transaction
                    .save()
                    .then(result => {
                        return WalletUser.findById(args.transactor)
                    })
                    .then(walletUser => {
                        //Error if wallet user ID is not among the wallet users in the db
                        console.log(walletUser)
                        if(!walletUser){
                            return new Response({
                                response_code: 404,
                                response_label: "Bad Request",
                                response_message: `Wallet User Does Not Exist`,
                            })
                        }

                        //increase wallet user balance
                        walletUser.balance = walletUser.balance + args.amount
                        walletUser.history.push(transaction)

                        //save changes for wallet user
                        console.log(walletUser)
                        return walletUser.save()
                    })
                    .then(result => {
                        //find transaction class of the transaction created
                        console.log(result)
                        return TransactionClass.findById("6385d4f5ced0c4a442fe8cad")
                    })
                    .then(transactionClass => {
                        console.log(transactionClass)

                        //returns an error if the transaction_type does not exist
                        if(!transactionClass){
                               return new Response({
                                response_code: 404,
                                response_label: "Bad Request",
                                response_message: `Transaction Class does not exist`,
                            })
                        }

                        //link transaction to transaction class
                        console.log(transaction)
                        transactionClass.classed_transactions.push(transaction)

                        //saves the update for the transaction class
                        console.log(transactionClass)
                        return transactionClass.save()
                    })
                    .then(result => {

                        //success response
                        return new Response({
                            response_message: `Cash In of ${args.amount} was successful`,
                        })
                    })
                    .catch(err => {
                        //unexpected error
                        return new Response({
                            response_code: 404,
                            response_label: "Bad Request",
                            response_message: `Cash In Failed`,
                        })
                    })
            }
        },

        //creates a transaction and links the transaction to the WalletUser using the given id as reference
        //if WalletUser's balance is less then the amount being withdrawn, it does not proceed with the operation. 
        //WalletUser's balance reduced with the amount if amount is less than balance

        debit: {
            type: ResponseType,
            //expected type is a response type in order to secure sensitive information like ids
            //mutation takes only the amount, the current balance of the transactor, and the id of the transactor
            args: {
                amount: {type: GraphQLFloat},
                balance: {type: GraphQLFloat},
                transactor: {type: GraphQLID}
            },
            resolve(parent, args){
                //transaction_type is already declared at the start since there are only 2 types of transaction mutations
                //creates the transaction given the arguments
                //initialy sets the status of transaction as successful
                //automatically assigns amount as negative since it is a withdrawal
                const transaction = new Transaction({
                    transaction_date: new Date().toISOString(),
                    amount: -(args.amount),
                    transactor: args.transactor,
                    transaction_type: "6385d4faced0c4a442fe8caf",
                    status: 1

                })

                //overrides status to fail if balance is less than amount
                if(args.balance < args.amount)
                    transaction.status = 0

                console.log(transaction)

                //save transaction if successful
                return transaction
                    .save()
                    .then(result => {
                        return WalletUser.findById(args.transactor)
                    })
                    .then(walletUser => {
                        console.log(walletUser)

                        //returns an error if user is not found in DB but saves the transaction with a status of failure
                        if(!walletUser)
                        {
                            return new Response({
                                response_code: 404,
                                response_label: "Bad Request",
                                response_message: `Wallet User Does Not Exist`,
                            })
                        }

                        //returns an error if  balance is less then the amount being withdrawn

                        if(walletUser.balance < args.amount)
                        {
                            return new Response({
                                response_code: 404,
                                response_label: "Bad Request",
                                response_message: "Balance Is Insufficient"
                            })
                        }
                        else
                        {
                            //proceeds with the withdrawal if balance is greater than amount being asked
                            walletUser.balance = walletUser.balance - args.amount
                            walletUser.history.push(transaction)

                            console.log(walletUser)
                            return walletUser.save()
                        }
                    })
                    .then(result => {
                        return TransactionClass.findById("6385d4faced0c4a442fe8caf")
                    })
                    .then(transactionClass => {

                        //returns an error if Transaction class does not exist
                        console.log(transactionClass)
                        if(!transactionClass){
                            return new Response({
                                response_code: 404,
                                response_label: "Bad Request",
                                response_message: `Transaction Class does not exist`,
                            })
                        }
                        
                        //links transaction to transaction class if it exists
                        transactionClass.classed_transactions.push(transaction)
                        
                        console.log(transactionClass)
                        return transactionClass.save()
                    })
                    .then(result => {
                        //returns a success
                        return new Response({
                            response_message: `Debit withdrawal of ${args.amount} was successful`,
                        })
                    })
                    .catch(err => {
                        //returns if there's an unexpected failure
                        return new Response({
                            response_code: 404,
                            response_label: "Bad Request",
                            response_message: `Cash In Failed`,
                        })
                    })
            }
        }
    }
})

//exports the queries, mutations, and types as a graphql schema which is loaded in the index.js
module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation

})

