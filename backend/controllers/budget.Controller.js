import Budget from '../models/budget_model.js'
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';


const setOrUpadateBudget = async(req, res)=>{
    try {
const { category, month, amount } = req.body;
const existing = await Budget.findOne({ userId: req.user._id, category,
month });
if (existing) {
existing.amount = amount;
await existing.save();
return res.json(existing);
}
const b = await Budget.create({ userId: req.user._id, category, month,
amount });
return res.status(201).json(new ApiResponse(201,{b},"Budget set or update successfully"));
} catch (err) {
res.status(500).json(new ApiError(500,"server Error"));
}

}


const GetBudget = async(req,res)=>{
  try {
      const userID = req.user._id;
      const budgets = await Budget.find({ userId: userID });
      if(!budgets) throw new ApiError(404,"no budget found");
  
      return res.status(200)
              .json(new ApiResponse(200,{budgets},"Budget fetched"));
  } catch (error) {
    return res.status(404)
            .json(new ApiError(404,"No budget found"));
  }
}
export {setOrUpadateBudget,GetBudget}

