import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
    amount : {
        type: String,
        required: true,
        trim: true
    },
    email : {
        type : String,
        required : true,
        trim : true
    },
    
})