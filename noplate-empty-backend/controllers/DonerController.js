const DonerModel = require("../models/DonerModel");
const FoodModel = require("../models/FoodModel");
const OrderModel = require("../models/OrderModel");

const hasPickupLocation = (location) => {
  if (!location || typeof location !== "object") {
    return false;
  }

  const hasCoordinates =
    typeof location.latitude === "number" &&
    !Number.isNaN(location.latitude) &&
    typeof location.longitude === "number" &&
    !Number.isNaN(location.longitude);
  const hasAddress =
    typeof location.address === "string" && location.address.trim().length > 0;

  return hasCoordinates || hasAddress;
};

const sortLatestFirst = {
  updatedAt: -1,
  createdAt: -1,
};

const mapDonerPayload = (body = {}, owner) => ({
  owner,
  title: body.title,
  imageUrl: body.imageUrl,
  food: body.food,
  time: body.time,
  pickup: body.pickup,
  delivery: body.delivery,
  isOpen: body.isOpen ?? body.isopen,
  rating: body.rating ?? body.Rating,
  ratingCount: body.ratingCount,
  location: body.location,
});

const syncOrdersForOutlet = async (outlet) => {
  const outletFoods = await FoodModel.find({ Doner: outlet._id }, { _id: 1 });
  const outletFoodIds = outletFoods.map((food) => food._id);

  if (outletFoodIds.length === 0) {
    return;
  }

  await OrderModel.updateMany(
    {
      foods: { $in: outletFoodIds },
    },
    {
      $set: {
        donorProfile: outlet._id,
        donorLocation: outlet.location,
      },
    }
  );
};

const ensureOutletAccess = (outlet, req) => {
  const owner = req.user?.userId;
  const role = req.user?.role;

  if (
    role !== "SUPER_ADMIN" &&
    String(outlet.owner || "") !== String(owner || "")
  ) {
    return false;
  }

  return true;
};

//create Doner
const createDonerController = async (req, res) => {
  try {
    const owner = req.user?.userId;
    const { title, location } = req.body;

    if (!title || !hasPickupLocation(location)) {
      return res.status(400).json({
        success: false,
        message: "Please provide outlet title and pickup location",
      });
    }

    if (!owner) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const payload = mapDonerPayload(req.body, owner);
    const doner = new DonerModel(payload);
    await doner.save();

    res.status(201).json({
      success: true,
      message: "Doner Created Successfully",
      doner,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error In Create Doner API",
      error,
    });
  }
};

// update Doner
const updateDonerController = async (req, res) => {
  try {
    const donerId = req.params.id ?? req.body.donerId ?? req.body.id;

    if (!donerId) {
      return res.status(400).json({
        success: false,
        message: "Please provide Doner id",
      });
    }

    const doner = await DonerModel.findById(donerId);
    if (!doner) {
      return res.status(404).json({
        success: false,
        message: "Doner Not Found",
      });
    }

    if (!ensureOutletAccess(doner, req)) {
      return res.status(403).json({
        success: false,
        message: "You can update only your own donor outlet",
      });
    }

    const payload = mapDonerPayload(req.body, doner.owner);
    const updateData = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined)
    );

    Object.assign(doner, updateData);

    if (!doner.title || !hasPickupLocation(doner.location)) {
      return res.status(400).json({
        success: false,
        message: "Please provide outlet title and pickup location",
      });
    }

    await doner.save();
    await syncOrdersForOutlet(doner);

    res.status(200).json({
      success: true,
      message: "Doner Updated Successfully",
      doner,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error In Update Doner API",
      error,
    });
  }
};

// get current signed-in donor entry
const getCurrentDonerController = async (req, res) => {
  try {
    const owner = req.user?.userId;

    if (!owner) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const doner = await DonerModel.findOne({ owner }).sort({
      ...sortLatestFirst,
    });

    if (!doner) {
      return res.status(404).json({
        success: false,
        message: "No donor profile found for current user",
      });
    }

    res.status(200).json({
      success: true,
      message: "Current Doner Fetched Successfully",
      doner,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error In Get Current Doner API",
      error,
    });
  }
};

// get current signed-in donor entries
const getMyDonersController = async (req, res) => {
  try {
    const owner = req.user?.userId;

    if (!owner) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const Doners = await DonerModel.find({ owner }).sort(sortLatestFirst);

    res.status(200).json({
      success: true,
      message: "My Doners Fetched Successfully",
      totalCount: Doners.length,
      Doners,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error In Get My Doners API",
      error,
    });
  }
};

//get all Doners
const getAllDonersController = async (req, res) => {
  try {
    const Doners = await DonerModel.find({}).sort(sortLatestFirst);
    if (!Doners || Doners.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Doners Found",
      });
    }
    res.status(200).json({
      success: true,
      message: "All Doners Fetched Successfully",
      totalCount: Doners.length,
      Doners,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error In Get All Doners API",
      error,
    });
  }
};

//get single Doner by id
const getSingleDonerController = async (req, res) => {
try{
    const Donerid=req.params.id;
    if(!Donerid){
        return res.status(400).json({
            success:false,
            message:"Please provide Doner id"
        });
    }
    //find doner
    const Doner=await DonerModel.findById(Donerid);
    if(!Doner){
        return res.status(404).json({
            success:false,
            message:"Doner Not Found"
        });
     }
    res.status(200).json({
        success:true,
        message:"Single Doner Fetched Successfully",
        Doner
    });

}catch(error){
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error In Get Single Doner API",
      error,
    });
}
} 
//Delete Doner by id
const deleteDonerController = async (req, res) => {
    try{
        const Donerid=req.params.id;
        if(!Donerid){
            return res.status(400).json({
                success:false,
                message:"Please provide Doner id"
            });
        }
        //find doner
        const Doner=await DonerModel.findById(Donerid);
        if(!Doner){
            return res.status(404).json({
                success:false,
                message:"Doner Not Found"
            });
         }

         if (!ensureOutletAccess(Doner, req)) {
            return res.status(403).json({
                success:false,
                message:"You can delete only your own donor profile"
            });
         }

         const linkedFood = await FoodModel.findOne({ Doner: Donerid }, { _id: 1 });
         if (linkedFood) {
            return res.status(400).json({
                success:false,
                message:"Delete outlet foods before deleting this donor outlet"
            });
         }

         await DonerModel.findByIdAndDelete(Donerid);
        res.status(200).json({
            success:true,
            message:"Doner Deleted Successfully",
        });  

}catch(error){
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error In Delete Doner API",
      error,
    });
}



}

module.exports = {
  createDonerController,
  getCurrentDonerController,
  getMyDonersController,
  getAllDonersController,
  getSingleDonerController,
  updateDonerController,
  deleteDonerController,
};
