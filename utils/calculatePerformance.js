// // utils/calculatePerformance.js
// const AssignedTask = require('../model/assignTaskModel');

// async function calculateUserPerformance(userId) {
//     try {
//         const tasks = await AssignedTask.find({ userId }); // Fetch tasks assigned to the user

//         const totalTasks = tasks.length; // Total tasks assigned
//         if (totalTasks === 0) return 0; // Return 0 if no tasks assigned

//         const completedTasks = tasks.filter(task => task.status === 'Completed').length;

//         const performancePercentage = Math.floor((completedTasks / totalTasks) * 100);  

//         return performancePercentage;
//     } catch (error) {
//         console.error("Error calculating performance:", error);
//         throw error;
//     }
// }

// module.exports = {calculateUserPerformance};
