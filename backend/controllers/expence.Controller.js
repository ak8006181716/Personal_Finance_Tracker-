import Expense from "../models/expence_model.js";
import User from "../models/user_model.js";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse.js";

const createExpence = async (req, res) => {
  try {
    const createExpen = Expense.create({ ...req.body, userId: req.user._id });
    if (!createExpen) throw new ApiError(401, "Expence not created");

    res.status(201).json(new ApiResponse(201, "Expence created", createExpen));
  } catch (error) {
    console.log("error in the creating Expence", error);
  }
};

const updateExpence = async (req, res) => {
  try {
    const updated = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true, runValidators: false }
    );
    if (!updated) throw new ApiError(401, "Expence not updated");

    return res
      .status(201)
      .json(new ApiResponse(201, { updated }, "Expence created successfully"));
  } catch (error) {
    console.log("error in the updating Expence", error);
  }
};

const getAllExpense = async (req, res) => {
  try {
    const { startDate, endDate, category, paymentMethod, q } = req.query;
    const filter = { userId: req.user._id };
    if (category) filter.category = category;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (startDate || endDate) filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
    if (q) filter.$or = [{ notes: { $regex: q, $options: "i" } }];
    const items = await Expense.find(filter).sort({ date: -1 });
    return res
      .status(201)
      .json(new ApiResponse(201, { items }, "Send all data"));
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const deleteExpence = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!expense) throw new ApiError(404,"expense not found");
   
    return res.status(201)
            .json(new ApiResponse(201,"Expense deleted"))
  } catch (err) {
    res.status(500).json(new ApiError(500,"server Error"));
  }
};

export { createExpence, updateExpence, getAllExpense, deleteExpence };
