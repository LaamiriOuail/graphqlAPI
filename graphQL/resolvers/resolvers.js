const Freelancer = require('../models/freelancer');
const Service = require('../models/services');
const Card = require('../models/cardpayment');
const jwt = require("jsonwebtoken");
require('dotenv').config();
const bcrypt = require('bcrypt');
const cloudinary = require("../../utils/coludinary")
const { GraphQLUpload } = require('graphql-upload');
const {BCRYPT_NUMBER,JWT_SECRET,JWT_EXPIRETIME} = process.env;

const resolvers = {
  Upload: GraphQLUpload,
    Query: {
      freelancers: async () => {//OK
          try {
            const allUsers = await Freelancer.find({});
            return allUsers;
          } catch (error) {
            console.log(error);
            return [];
          }
      },
      freelancerByToken: async (_, { token }) => {//OK
          try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await Freelancer.findById(decoded.idFreelancer);
            if(!user){
              throw new Error('Freelancer not found');
            }
            return user;
          } catch (err) {
            throw new Error(`Failed to fetch freelancer: ${err}`);
          }
        },
        freelancerLogin: async (_, { email, password }) => {
            const user = await Freelancer.findOne({email:email});
            if(!user || !(await bcrypt.compare(password, user.password))) throw new Error('Invalid email or password '); 
            const token = jwt.sign({
              idFreelancer: user.id,
            }, JWT_SECRET, {
                expiresIn: `${JWT_EXPIRETIME}h`
            });            
            return {
              token: token,
              tokenExpiration: JWT_EXPIRETIME
            };
        },
        services:async ()=>{
          try {
            const allServices = await Service.find({});
            return allServices;
          } catch (error) {
            console.log(error);
            return [];
          }
        },
        servicesByToken: async (_, { token }) => {//OK
          try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const idfreelancer=decoded.idFreelancer;
            const user = await Freelancer.findById(idfreelancer);
            if(!user){
              throw new Error('Freelancer not found');
            }
            const freelancerServices = await Service.find({idfreelancer});
            if(!freelancerServices){
              throw new Error('Services not found');
            }
            return freelancerServices;
          } catch (error) {
            throw new Error(`Error : ${error}`);
          }
        },
        serviceById: async (_, { id }) => {//O
          try{
            const service = await Service.findById({id});
            if(!service){
              throw new Error('Services not found');
            }
            return service;
          } catch (error) {
            throw new Error(`Error : ${error}`);
          }
        },
    },
    Mutation: {
      uploadSingleImage:async (_, { image })=>{
        try {
          const { createReadStream } = await image;
          const result = await new Promise((resolve, reject) => {
            createReadStream().pipe(
              cloudinary.uploader.upload_stream((error, result) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(result);
                }
              })
            );
          });
      
          return { message: result.secure_url };
        } catch (err) {
          throw new Error(err);
        }
      },
      createFreelancer: async (_, { username, email, password, country, phone, description }) => {
        // Check if a user with the same username or email already exists
        const existingUser = await Freelancer.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
          if (existingUser.email === email || existingUser.username === username) {
              throw new Error('Email or Username already in use');
          }
        }
        //Hash password
        const hashedPassword = await bcrypt.hash(password, +BCRYPT_NUMBER);
        const user = new Freelancer({ username, email, password:hashedPassword, country, phone, description});
        //Create token freelancer in collection token and save
        user.save();
        return {message:"Freeelancer created successfully"}
      },
      updateFreelancer: async (_, { token,username, password, country, phone, description }) => {//Ok
       
        try { 
          const decoded = jwt.verify(token, JWT_SECRET);
          const user = await Freelancer.findById(decoded.idFreelancer);
          if(!user){
              throw new Error('Freelancer not found');
          }
          let hashedPassword;
          if(password){
            //Hash password
            hashedPassword = await bcrypt.hash(password, +BCRYPT_NUMBER);
          }
            const updatedUser = await Freelancer.findByIdAndUpdate(
              user.id,
              { username, password:hashedPassword, country, phone, description },
              { new: true }
            );
            const tokenN = jwt.sign({
              idFreelancer: updatedUser.id,
            }, JWT_SECRET, {
                expiresIn: `${JWT_EXPIRETIME}h`
            });            
            return {
              token: tokenN,
              tokenExpiration: JWT_EXPIRETIME
            };
        } catch (err) {
          throw new Error(`Failed to update freelancer: ${err}`);
        }
      },
      deleteFreelancer: async (_, { token }) => {//OK
          try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const deletedUser = await Freelancer.findByIdAndRemove(decoded.idFreelancer);
            if(!user){
                throw new Error('Freelancer not found');
            }
            return deletedUser;
          } catch (error) {
            throw new Error(`Failed to delete freelancer: ${error}`);
          }
        },
      
      createService: async (_,{token,title, subtitle, description, subdescription, category, delevrytime, price})=>{
        try{
          const decoded = jwt.verify(token, JWT_SECRET);
          const idfreelancer = decoded.idFreelancer;
          const existingUser = await Freelancer.findById(idfreelancer);
          if (!existingUser) {
            throw new Error('Freelancer not exists');
          }
          const existingService = await Service.findOne({ $and: [{ title }, { idfreelancer }] });
          if (existingService) {
            throw new Error('Service already exists');
          }
          // Create and save the new user
          const service = new Service({ title, subtitle, description, subdescription, category, delevrytime, price, idfreelancer });
          return service.save();
        }catch (error) {
          throw new Error(`Failed to create service: ${error}`);
        }
        
      },
      updateService: async (_, {token, id, title, subtitle, description, subdescription, category, delevrytime, price }) => {//Ok
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          const idfreelancer = decoded.idFreelancer;
          const existingUser = await Freelancer.findById(idfreelancer);
          if (!existingUser) {
            throw new Error('Freelancer not exists');
          }
          const existingService = await Service.findById(id);
          if (existingService.idfreelancer!==idfreelancer) {
            throw new Error('Service not exists');
          }
          const updatedService = await Service.findByIdAndUpdate(
            id,
            { title, subtitle, description, subdescription, category, delevrytime, price },
            { new: true }
          );
          return updatedService;
        } catch (err) {
          throw new Error(`Failed to update service: ${err}`);
        }
      },
      deleteService: async (_, {token, id }) => {//OK
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          const idfreelancer = decoded.idFreelancer;
          const existingUser = await Freelancer.findById(idfreelancer);
          if (!existingUser) {
            throw new Error('Freelancer not exists');
          }
          const existingService = await Service.findById(id);
          if (existingService.idfreelancer!==idfreelancer) {
            throw new Error('Service not exists');
          }
          const deletedUser = await Service.findByIdAndRemove(id);
          return deletedUser;
        } catch (error) {
          throw new Error(`Failed to delete freelancer: ${error}`);
        }
      },
      addInfoCard:async (_,{token,nameCard,cardNumber,ExpiryDate,cvv})=>{
        try{
          const decoded = jwt.verify(token, JWT_SECRET);
          const idFreelancer = decoded.idFreelancer;
          const existingUser = await Freelancer.findById(idFreelancer);
          if (!existingUser) {
            throw new Error('Freelancer not exists');
          }
          const card =await new Card({idFreelancer,cardNumber,nameCard,ExpiryDate,cvv})
          card.save()
          return {message : "Card info added successfully"}
        }catch(error){
        throw new Error(`Failed to add info card: ${error}`);
       }
    }
    }
  };

module.exports = resolvers;