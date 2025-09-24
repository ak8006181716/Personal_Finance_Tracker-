import Expense from "../models/expence_model.js";
import User from "../models/user_model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

const createExpence = async (req, res) => {
  try {
    const payload = {
      amount: Number(req.body.amount),
      category: req.body.category,
      date: req.body.date ? new Date(req.body.date) : new Date(),
      paymentMethod: req.body.paymentMethod,
      notes: req.body.notes,
      userId: req.user._id,
    };
    const createExpen = await Expense.create(payload);
    if (!createExpen) throw new ApiError(401, "Expence not created");

    res.status(201).json(new ApiResponse(201, { expense: createExpen }, "Expense created"));
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
      .json(new ApiResponse(201, { updated }, "Expence updated successfully"));
  } catch (error) {
    console.log("error in the updating Expence", error);
  }
};

const getAllExpenseByID = async (req, res) => {
  try {
    const { startDate, endDate, category, paymentMethod, q } = req.query;
    const filter = { userId: req.user._id };
    if (category) filter.category = { $regex: category, $options: "i" };
    if (paymentMethod) filter.paymentMethod = { $regex: paymentMethod, $options: "i" };
    if (startDate || endDate) filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
    if (q) filter.$or = [{ notes: { $regex: q, $options: "i" } }];
    const items = await Expense.find(filter).sort({ date: -1 });
    return res
      .status(200)
      .json(new ApiResponse(200, { expenses: items }, "Expenses fetched"));
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
const getExpences =async(req,res)=>{
    
    try {
        const expenses = await Expense.find({ userId: req.user._id });
        res.status(200).json(new ApiResponse(200,{expenses},"All expenses fetched"));
    }
    catch (error) {
        res.status(500).json(new ApiError(500,"server Error"));
    }

}

export { createExpence, updateExpence, getAllExpenseByID, deleteExpence,getExpences };
