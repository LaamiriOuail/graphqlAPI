const {gql} = require('apollo-server-express');

const typeDefs = gql`
  type Freelancer {
    id: ID
    username: String!
    email: String!
    password: String!
    country: String
    phone: String!
    description: String
  }
  type Service {
    id:ID
    title: String!
    subtitle: String!
    description: String!
    subdescription: String!
    category: String!
    delevrytime: String!
    price: String!
    idfreelancer: String!
    }
    type AuthData {
      token: String!,
      tokenExpiration: Int!,
    },
    type CardPayment{
      id:ID!
      name:String!
      cardNumber:String!
      ExpiryDate:String!
      cvv:String!
      idFreelancer:String!
    },
    type File {
    filename: String!,
    mimetype: String!,
    encoding: String!,
    cloudinaryUrl: String!,
    },
    type messageFinal{
      message : String!
    }
    scalar Upload,
  type Query {
    # Freelancer queries
    freelancers: [Freelancer]
    freelancerByToken(token: String!): Freelancer
    freelancerLogin(email: String!,password:String!): AuthData
    # Service queries
    services: [Service]
    servicesByToken(token: String!): [Service]
    serviceById(id: ID!): Service
  }
  type Mutation {
    uploadSingleImage(image:Upload!):messageFinal
    # User mutations
    createFreelancer(username:String!, email:String!,password:String!,country:String!,phone:String!,description:String!): messageFinal
    updateFreelancer(token:String!, username:String,password:String,country:String,phone:String,description:String): AuthData
    deleteFreelancer(token: ID!): Freelancer
    # Service mutations
    createService(token:String!,title: String!, subtitle: String!, description: String!, subdescription: String!, category: String!, delevrytime: String!, price: String!): Service
    updateService(token:String!,id: ID!, title: String, subtitle: String, description: String, subdescription: String, category: String, delevrytime: String, price: String): Service
    deleteService(token:String!,id: ID!): Service
    #Card payment
    addInfoCard(token:String!,nameCard:String!,cardNumber:String!,ExpiryDate:String!,cvv:String!): messageFinal
  }
`;

module.exports = typeDefs;