const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const User = require("../model/userModel");
const { writeToStream } = require("fast-csv");
const { stringify } = require("csv-stringify");
const {sendVerificationEmail}  = require("../utils/userDataExport");
const nodemailer = require("nodemailer");
 

exports.importCSV = async (req, res) => {
  try {
    const filePath = req.file.path;  
    const users = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const { email, username, password } = row;

        if (email && username && password) {
          users.push(row);  
        } else {
          console.warn(`Missing required fields in row: ${JSON.stringify(row)}`);
        }
      })
      .on('end', async () => {
         const validUsers = users.slice(0, 25);

        if (validUsers.length === 0) {
          fs.unlink(filePath, (err) => {
            if (err) console.error(`Error deleting file: ${filePath}`, err);
          });
          return res.status(400).json({ message: 'No valid data found in CSV to import' });
        }

        try {
          const results = await Promise.all(
            validUsers.map(async (user) => {
              const { email, username, password } = user;
              return await User.findOneAndUpdate(
                { email },  
                { username, password },  
                { new: true, upsert: true }  
              );
            })
          );

          fs.unlink(filePath, (err) => {
            if (err) console.error(`Error deleting file: ${filePath}`, err);
          });

          const message = users.length > 25 
            ? "Only the first 25 records were imported. Please modify the CSV and try again." 
            : 'All valid records from CSV were processed and updated.';

          res.status(200).json({ message, Data: results });
        } catch (error) {
          fs.unlink(filePath, (err) => {
            if (err) console.error(`Error deleting file: ${filePath}`, err);
          });
          res.status(500).json({ message: 'Error saving users to the database', error });
        }
      })
      .on('error', (error) => {
        fs.unlink(filePath, (err) => {
          if (err) console.error(`Error deleting file: ${filePath}`, err);
        });
        res.status(500).json({ message: 'Error reading CSV file', error });
      });
  } catch (error) {
    res.status(500).json({ message: 'File processing error', error });
  }
};


exports.exportCSV = async (req, res) => {
  try {
    const users = await User.find().select("username email -_id").lean();

    if (users.length === 0) {
      return res.status(404).json({ message: "No data available to export" });
    }

    const filePath = path.join(__dirname, "../uploads/employee.csv");
    const ws = fs.createWriteStream(filePath);

    writeToStream(ws, users, { headers: true })
      .on("finish", async () => {
        try {
           const emailAddress = "hetvi.elitesigma@gmail.com"; 
          await sendVerificationEmail(emailAddress, filePath);
          res.status(200).json({ message: "CSV exported and sent via email" });
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
      })
      .on("error", (err) => {
        res.status(500).json({ message: "Error writing CSV file", error: err });
      });
      
  } catch (error) {
    res.status(500).json({ message: "Error retrieving data", error });
  }
};
