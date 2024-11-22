const cron = require('node-cron');
const BalanceModel = require('../model/balanceModel');
const User = require("../model/userModel");

const updateLeaveBalances = async () => {
  try {

     const leaveBalnceCron = await User.aggregate([
      {
        $lookup: {
          from: "balances",  
          localField: "_id",
          foreignField: "userId",
          as: "balanceDetails"
        }
      },
      {
        $unwind: "$balanceDetails"  
      },
      {
        $project: {  //specific field exists
          _id: 1,
          username: 1,
          "balanceDetails._id": 1,
          "balanceDetails.totalBalance": 1,
          "balanceDetails.userid": 1
        }
      }
    ]);  

     for (let user of leaveBalnceCron) {
      let balance = user.balanceDetails;

       if (balance.totalBalance < 6) {
        balance.totalBalance = 12;  
      } else if(balance.totalBalance === null){
        balance.totalBalance = 12; 
      } else if (balance.totalBalance >= 6) {
        balance.totalBalance += 12;
      }


       await BalanceModel.findByIdAndUpdate(balance._id, { totalBalance: balance.totalBalance });
    }

    console.log('Leave balances updated for all users.');
  } catch (err) {
    console.error('Error updating leave balances:', err);
  }
};

 cron.schedule('0 0 1 * *', () => {
  console.log('Running scheduled job to update leave balances...');
  updateLeaveBalances();
});

module.exports = { updateLeaveBalances };
