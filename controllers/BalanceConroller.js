const BalanceLeave = require("../model/balanceModel");

 exports.getBalanceLeave = async (req, res) => {
  try {
    const balances = await BalanceLeave.find();
    res.status(200).json(balances);
  } catch (error) {
    res.status(500).json({ message: "An error occurred while fetching leave balances.", error: error.message });
  }
};

 exports.updateBalanceLeave = async (req, res) => {
  try {
    const { userId } = req.params;
    const { totalBalance } = req.body;  

     const updatedBalance = await BalanceLeave.findOneAndUpdate(
      { userId },
      { totalBalance },
      { new: true }
    );

    if (!updatedBalance) {
      return res.status(404).json({ message: "Balance not found for this user." });
    }
    res.status(200).json(updatedBalance);
  } catch (error) {
    res.status(500).json({ message: "Error updating total balance.", error: error.message });
  }
};



