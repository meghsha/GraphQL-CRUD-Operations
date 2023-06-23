const express = require('express')
const expressGraphQL = require('express-graphql').graphqlHTTP
const {GraphQLList, GraphQLNonNull, GraphQLString, GraphQLObjectType, GraphQLInt, GraphQLSchema} = require('graphql')

const app = express()

const authors = [
	{ id: 1, name: 'J. K. Rowling' },
	{ id: 2, name: 'J. R. R. Tolkien' },
	{ id: 3, name: 'Brent Weeks' }
]

const books = [
	{ id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
	{ id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
	{ id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
	{ id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
	{ id: 5, name: 'The Two Towers', authorId: 2 },
	{ id: 6, name: 'The Return of the King', authorId: 2 },
	{ id: 7, name: 'The Way of Shadows', authorId: 3 },
	{ id: 8, name: 'Beyond the Shadows', authorId: 3 }
]

const BookType = new GraphQLObjectType({
    name: "Book",
    description: "This represents a book written by an author",
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        authorId: {type: GraphQLNonNull(GraphQLInt)},
        author: {
            type: AuthorType,
            resolve: (book) => {
                return authors.find(author => author.id === book.authorId)
            }
        }
    })
})

const AuthorType = new GraphQLObjectType({
    name: "Author",
    description: "This represents an author of a book",
    fields:  () => ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        books: {
            type: new GraphQLList(BookType),
            resolve: (author) => {
                return books.filter(book => book.authorId === author.id)
            }
        }
    })
})

const RootQueryType = new GraphQLObjectType({
    name: "Query",
    description: "Root Query",
    fields: () => ({
        book: {
            type: BookType,
            description: "A single book",
            args: {
                id: {type: GraphQLInt}
            },
            resolve: (parent, args) => books.find(book => book.id === args.id)
        },
        books: {
            type: new GraphQLList(BookType),
            description: "List of all books",
            resolve: () => {
                return books
            }
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: "List of all authors",
            resolve: () => {
                return authors
            }
        },
        author: {
            type: AuthorType,
            description: "A single author",
            args: {
                id: {type: GraphQLInt}
            },
            resolve: (parent, args) => authors.find(author => author.id === args.id)
        }
    })
})

const RootMutationType = new GraphQLObjectType({
    name: "Mutation",
    description: "Root Mutation",
    fields: () => ({
        addBook: {
            type: BookType,
            description: "Add a book",
            args: {
                id: {type: GraphQLNonNull(GraphQLInt)},
                name: {type: GraphQLNonNull(GraphQLString)},
                authorId: {type: GraphQLNonNull(GraphQLInt)},
            },
            resolve: (parent, args) => {
                const book = {id: args.id, name: args.name, authorId: args.authorId}
                books.push(book)
                return book
            }
        },

        deleteBook: {
            type: BookType,
            description: "Delete a book",
            args: {
                id: {type: GraphQLNonNull(GraphQLInt)},
            },
            resolve: (parent, args) => {
                const book = books.find(book => book.id === args.id)
                books.splice(books.indexOf(book), 1)
                return book
            }
        },

        updateBook: {
            type: BookType,
            description: "Update a book",
            args: {
                id: {type: GraphQLNonNull(GraphQLInt)},
                name: {type: GraphQLNonNull(GraphQLString)},
                authorId: {type: GraphQLNonNull(GraphQLInt)},
            },
            resolve: (parent, args) => {
                const book = books.find(book => book.id === args.id)
                book.name = args.name
                book.authorId = args.authorId
                return book
            }
        },

        addAuthor: {
            type: AuthorType,
            description: "Add an author",
            args: {
                id: {type: GraphQLNonNull(GraphQLInt)},
                name: {type: GraphQLNonNull(GraphQLString)},
            },
            resolve: (parent, args) => {
                const author = {id: args.id, name: args.name}
                authors.push(author)
                return author
            },
        },

        deleteAuthor: {
            type: AuthorType,
            description: "Delete an author",
            args: {
                id: {type: GraphQLNonNull(GraphQLInt)},
            },
            resolve: (parent, args) => {
                const author = authors.find(author => author.id === args.id)
                authors.splice(authors.indexOf(author), 1)
                return author
            }
        },

        updateAuthor: {
            type: AuthorType,
            description: "Update an author",
            args: {
                id: {type: GraphQLNonNull(GraphQLInt)},
                name: {type: GraphQLNonNull(GraphQLString)},
            },
            resolve: (parent, args) => {
                const author = authors.find(author => author.id === args.id)
                author.name = args.name
                return author
            }
        }
    })
})

const librarySchema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})

app.use("/graphql", expressGraphQL({
    schema: librarySchema,
    graphiql: true,
}))

app.listen(5000, () => console.log('Server Running on port 5000'))