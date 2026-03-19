const FoodModel = require("../models/FoodModel");
const DonerModel = require("../models/DonerModel");
const OrderModel = require("../models/OrderModel");

const ORDER_TRANSITIONS = {
  pending: ["accepted", "rejected"],
  accepted: ["completed"],
  rejected: [],
  completed: [],
};

const ORDER_UPDATE_STATUSES = ["accepted", "rejected", "completed"];

const OUTLET_SELECT = "owner title imageUrl time pickup delivery isOpen location";
const USER_SELECT = "name email role";

const mapFoodPayload = (body = {}) => ({
  title: body.title ?? body.name,
  decription: body.description ?? body.decription,
  imageUrl: body.imageUrl,
  foodTags: body.foodTags,
  catagory: body.category ?? body.catagory,
  code: body.code,
  isAvailable: body.isAvailable,
  Doner: body.outlet ?? body.outletId ?? body.doner ?? body.Doner,
  expireTime: body.expireTime,
  rating: body.rating,
  ratingCount: body.ratingCount,
});

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

const getObjectIdString = (value) => {
  if (!value) {
    return undefined;
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object" && value._id) {
    return String(value._id);
  }

  return undefined;
};

const getFoodOwnerId = (food) => getObjectIdString(food?.owner);

const getOutletOwnerId = (outlet) => {
  if (!outlet || typeof outlet !== "object") {
    return undefined;
  }

  return getObjectIdString(outlet.owner);
};

const getLatestDonorProfile = async (donorUserId) => {
  if (!donorUserId) {
    return null;
  }

  return DonerModel.findOne({ owner: donorUserId }).sort({
    updatedAt: -1,
    createdAt: -1,
  });
};

const populateFoodQuery = (query) =>
  query
    .populate({
      path: "Doner",
      select: OUTLET_SELECT,
    })
    .populate({
      path: "owner",
      select: USER_SELECT,
    });

const populateOrderQuery = (query) =>
  query
    .populate({
      path: "foods",
      populate: {
        path: "Doner",
        select: OUTLET_SELECT,
      },
    })
    .populate({
      path: "foods",
      populate: {
        path: "owner",
        select: USER_SELECT,
      },
    })
    .populate({
      path: "donorProfile",
      select: OUTLET_SELECT,
    });

const getOutletById = async (outletId) => {
  if (!outletId) {
    return null;
  }

  return DonerModel.findById(outletId);
};

const resolveOutletFromFood = async (food) => {
  if (!food) {
    return null;
  }

  if (food.Doner && typeof food.Doner === "object" && food.Doner.location) {
    return food.Doner;
  }

  const outletId = getObjectIdString(food.Doner);
  if (outletId) {
    const outlet = await getOutletById(outletId);
    if (outlet) {
      return outlet;
    }
  }

  const ownerId = getFoodOwnerId(food) ?? outletId;
  return getLatestDonorProfile(ownerId);
};

const resolveFoodOwnerId = async (food) => {
  const ownerId = getFoodOwnerId(food);
  if (ownerId) {
    return ownerId;
  }

  if (food?.Doner && typeof food.Doner === "object") {
    const outletOwnerId = getOutletOwnerId(food.Doner);
    if (outletOwnerId) {
      return outletOwnerId;
    }
  }

  const outletId = getObjectIdString(food?.Doner);
  if (!outletId) {
    return undefined;
  }

  const outlet = await getOutletById(outletId);
  if (outlet?.owner) {
    return String(outlet.owner);
  }

  return outletId;
};

const ensureManagedOutlet = async (outletId, userId, userRole) => {
  const outlet = await getOutletById(outletId);
  if (!outlet) {
    return {
      error: {
        status: 404,
        message: "Donor outlet not found",
      },
    };
  }

  if (
    userRole !== "SUPER_ADMIN" &&
    String(outlet.owner || "") !== String(userId || "")
  ) {
    return {
      error: {
        status: 403,
        message: "You can manage foods only for your own donor outlets",
      },
    };
  }

  return { outlet };
};

const getFoodQueryForOwner = async (userId) => {
  const ownedOutlets = await DonerModel.find({ owner: userId }, { _id: 1 });
  const outletIds = ownedOutlets.map((outlet) => outlet._id);

  return outletIds.length > 0
    ? {
        $or: [
          { owner: userId },
          { Doner: { $in: outletIds } },
          { Doner: userId },
        ],
      }
    : {
        $or: [{ owner: userId }, { Doner: userId }],
      };
};

// create food
const createFoodController = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const payload = mapFoodPayload(req.body);
    const { title, decription, catagory, code, Doner } = payload;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!title || !decription || !catagory || !code || !Doner) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields including donor outlet",
      });
    }

    const { outlet, error } = await ensureManagedOutlet(Doner, userId, userRole);
    if (error) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }

    const newFood = new FoodModel({
      ...payload,
      owner: outlet.owner,
      Doner: outlet._id,
    });
    await newFood.save();

    const food = await populateFoodQuery(FoodModel.findById(newFood._id));

    res.status(201).json({
      success: true,
      message: "Food Created Successfully",
      food,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error In Create Food API",
      error,
    });
  }
};

// get all foods
const getAllFoodsController = async (req, res) => {
  try {
    const foods = await populateFoodQuery(
      FoodModel.find({}).sort({ createdAt: -1 })
    );
    res.status(200).json({
      success: true,
      totalFoods: foods.length,
      message: "Foods Fetched Successfully",
      foods,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error In Get All Foods API",
      error,
    });
  }
};

// get single food by id
const getSingleFoodController = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Food id is required",
      });
    }

    const food = await populateFoodQuery(FoodModel.findById(id));
    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food Not Found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Food Fetched Successfully",
      food,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error In Get Single Food API",
      error,
    });
  }
};

// get food by donor outlet
const getFoodByDonerController = async (req, res) => {
  try {
    const { donerId } = req.params;
    if (!donerId) {
      return res.status(400).json({
        success: false,
        message: "Doner id is required",
      });
    }

    const foods = await populateFoodQuery(
      FoodModel.find({
        $or: [{ Doner: donerId }, { owner: donerId }],
      }).sort({ createdAt: -1 })
    );

    if (!foods || foods.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Food Not Found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Food by donor outlet fetched successfully",
      foods,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error In Get Food By Doner API",
      error,
    });
  }
};

// get foods by current donor owner
const getMyFoodsController = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const foodQuery = await getFoodQueryForOwner(userId);
    const foods = await populateFoodQuery(
      FoodModel.find(foodQuery).sort({ createdAt: -1 })
    );

    res.status(200).json({
      success: true,
      totalFoods: foods.length,
      message: "My foods fetched successfully",
      foods,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error in get my foods api",
      error,
    });
  }
};

// update food
const updateFoodController = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const foodId = req.params.id ?? req.body.foodId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!foodId) {
      return res.status(400).json({
        success: false,
        message: "Food id is required",
      });
    }

    const food = await FoodModel.findById(foodId);
    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food Not Found",
      });
    }

    const foodOwnerId = await resolveFoodOwnerId(food);
    if (
      userRole !== "SUPER_ADMIN" &&
      String(foodOwnerId || "") !== String(userId)
    ) {
      return res.status(403).json({
        success: false,
        message: "You can update only your own foods",
      });
    }

    const payload = mapFoodPayload(req.body);
    const updateData = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined)
    );

    if (updateData.Doner) {
      const { outlet, error } = await ensureManagedOutlet(
        updateData.Doner,
        userId,
        userRole
      );
      if (error) {
        return res.status(error.status).json({
          success: false,
          message: error.message,
        });
      }

      updateData.Doner = outlet._id;
      updateData.owner = outlet.owner;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    const updatedFood = await FoodModel.findByIdAndUpdate(foodId, updateData, {
      new: true,
      runValidators: true,
    });
    const populatedFood = await populateFoodQuery(
      FoodModel.findById(updatedFood._id)
    );

    res.status(200).json({
      success: true,
      message: "Food Updated Successfully",
      food: populatedFood,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error in update food api",
      error,
    });
  }
};

// delete food
const deleteFoodController = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const foodId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!foodId) {
      return res.status(400).json({
        success: false,
        message: "Food id is required",
      });
    }

    const food = await FoodModel.findById(foodId);
    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food Not Found",
      });
    }

    const foodOwnerId = await resolveFoodOwnerId(food);
    if (
      userRole !== "SUPER_ADMIN" &&
      String(foodOwnerId || "") !== String(userId)
    ) {
      return res.status(403).json({
        success: false,
        message: "You can delete only your own foods",
      });
    }

    await FoodModel.findByIdAndDelete(foodId);
    res.status(200).json({
      success: true,
      message: "Food Deleted Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error in delete food api",
      error,
    });
  }
};

// place order
const placeOrderController = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (userRole !== "NGO") {
      return res.status(403).json({
        success: false,
        message: "Only NGO can place orders",
      });
    }

    const cartItems = req.body.cartItems ?? req.body.cartitems;
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "cartItems is required",
      });
    }

    const foodIds = [
      ...new Set(
        cartItems
          .map((item) => {
            if (!item) return undefined;
            if (typeof item === "string") return item;
            return item._id ?? item.foodId ?? item.id;
          })
          .filter(Boolean)
      ),
    ];

    if (foodIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid food ids provided",
      });
    }

    const foods = await FoodModel.find({
      _id: { $in: foodIds },
      isAvailable: true,
    });

    if (foods.length !== foodIds.length) {
      return res.status(400).json({
        success: false,
        message: "Some food items are invalid or unavailable",
      });
    }

    const outlets = await Promise.all(foods.map((food) => resolveOutletFromFood(food)));
    const outletIds = [...new Set(outlets.map((outlet) => getObjectIdString(outlet)).filter(Boolean))];

    if (outletIds.length !== 1) {
      return res.status(400).json({
        success: false,
        message: "Place order for foods from one donor outlet at a time",
      });
    }

    const donorProfile = outlets[0];

    const order = new OrderModel({
      foods: foods.map((food) => food._id),
      NGO: userId,
      donorProfile: donorProfile?._id,
      donorLocation: donorProfile?.location,
    });

    await order.save();
    const populatedOrder = await populateOrderQuery(OrderModel.findById(order._id));

    res.status(201).json({
      success: true,
      message: "Order Placed Successfully",
      order: populatedOrder,
      donorId: donorProfile?._id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error in place order api",
      error,
    });
  }
};

// NGO get own orders
const getNgoOrdersController = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (userRole !== "NGO") {
      return res.status(403).json({
        success: false,
        message: "Only NGO can view these orders",
      });
    }

    const orders = await populateOrderQuery(
      OrderModel.find({ NGO: userId }).sort({ createdAt: -1 })
    );

    for (const order of orders) {
      if (order.donorLocation && order.donorProfile) {
        continue;
      }

      const donorProfile = await resolveOutletFromFood(order.foods?.[0]);

      if (!donorProfile) {
        continue;
      }

      const nextFields = {};

      if (!order.donorProfile) {
        order.donorProfile = donorProfile;
        nextFields.donorProfile = donorProfile._id;
      }

      if (!order.donorLocation && hasPickupLocation(donorProfile.location)) {
        order.donorLocation = donorProfile.location;
        nextFields.donorLocation = donorProfile.location;
      }

      if (Object.keys(nextFields).length > 0) {
        await OrderModel.updateOne({ _id: order._id }, { $set: nextFields });
      }
    }

    res.status(200).json({
      success: true,
      totalOrders: orders.length,
      message: "NGO orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error in get NGO orders api",
      error,
    });
  }
};

// donor get incoming orders for own foods
const getDonorOrdersController = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (userRole !== "DONOR") {
      return res.status(403).json({
        success: false,
        message: "Only donor can view these orders",
      });
    }

    const donorFoodQuery = await getFoodQueryForOwner(userId);
    const donorFoods = await FoodModel.find(donorFoodQuery, { _id: 1 });
    const donorFoodIds = donorFoods.map((food) => food._id);

    if (donorFoodIds.length === 0) {
      return res.status(200).json({
        success: true,
        totalOrders: 0,
        message: "Donor orders fetched successfully",
        orders: [],
      });
    }

    const orders = await populateOrderQuery(
      OrderModel.find({
        foods: { $in: donorFoodIds },
      })
        .populate({
          path: "NGO",
          select: USER_SELECT,
        })
        .sort({ createdAt: -1 })
    );

    res.status(200).json({
      success: true,
      totalOrders: orders.length,
      message: "Donor orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error in get donor orders api",
      error,
    });
  }
};

// donor/admin update order status
const updateOrderStatusController = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const orderId = req.params.orderId ?? req.body.orderId;
    const requestedStatus = String(req.body.status || "").toLowerCase();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!["DONOR", "SUPER_ADMIN"].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Only donor or admin can update order status",
      });
    }

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order id is required",
      });
    }

    if (!ORDER_UPDATE_STATUSES.includes(requestedStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed updates: ${ORDER_UPDATE_STATUSES.join(
          ", "
        )}`,
      });
    }

    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order Not Found",
      });
    }

    const foods = await FoodModel.find(
      { _id: { $in: order.foods } },
      { owner: 1, Doner: 1 }
    );

    if (userRole === "DONOR") {
      const foodOwnerIds = [
        ...new Set(
          (
            await Promise.all(foods.map((food) => resolveFoodOwnerId(food)))
          ).filter(Boolean)
        ),
      ];

      if (foodOwnerIds.length !== 1 || foodOwnerIds[0] !== String(userId)) {
        return res.status(403).json({
          success: false,
          message: "You can update status only for your own outlet orders",
        });
      }
    }

    if (requestedStatus === "accepted") {
      const donorProfile = await resolveOutletFromFood(foods[0]);

      if (!donorProfile || !hasPickupLocation(donorProfile.location)) {
        return res.status(400).json({
          success: false,
          message:
            "Save pickup location on the donor outlet before accepting this order",
        });
      }

      order.donorProfile = donorProfile._id;
      order.donorLocation = donorProfile.location;
    }

    const allowedNextStatuses = ORDER_TRANSITIONS[order.status] || [];
    if (!allowedNextStatuses.includes(requestedStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid transition from ${order.status} to ${requestedStatus}`,
      });
    }

    order.status = requestedStatus;
    await order.save();

    const updatedOrder = await populateOrderQuery(OrderModel.findById(order._id));

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error in update order status api",
      error,
    });
  }
};

module.exports = {
  createFoodController,
  getAllFoodsController,
  getSingleFoodController,
  getFoodByDonerController,
  getMyFoodsController,
  updateFoodController,
  deleteFoodController,
  placeOrderController,
  getNgoOrdersController,
  getDonorOrdersController,
  updateOrderStatusController,
};
