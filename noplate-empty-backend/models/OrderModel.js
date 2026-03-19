const mongoose = require("mongoose");

//schema
const OrderSchema = new mongoose.Schema(
   {
    foods:[
        {
             type:mongoose.Schema.Types.ObjectId,
                ref:"Foods"
        }
      
    ],
    NGO:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    donorProfile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doner"
    },
    donorLocation: {
        id: { type: String },
        latitude: { type: Number },
        latitudeDelta: { type: Number },
        longitude: { type: Number },
        longitudeDelta: { type: Number },
        address: { type: String },
        title: { type: String },
    },
    status:{
        type:String,
        enum:["pending","accepted","rejected","completed"],
        default:"pending"
    }
    
   },
   
    {timestamps:true}
);

//export
module.exports = mongoose.model("Order", OrderSchema);
