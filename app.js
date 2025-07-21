// app.js
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const path = require("path");

const app = express();

// Middleware
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "signup.html"));
});

app.post("/", (req, res) => {
  const { fname: firstName, lname: lastName, email } = req.body;

  if (!firstName || !lastName || !email) {
    return res.status(400).sendFile(path.join(__dirname, "failure.html"));
  }

  const data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
        },
      },
    ],
  };

  const jsonData = JSON.stringify(data);
  const url = `https://${process.env.MAILCHIMP_DC}.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_LIST_ID}`;
  const options = {
    method: "POST",
    auth: `anystring:${process.env.MAILCHIMP_API_KEY}`,
  };

  const request = https.request(url, options, (response) => {
    let responseData = "";

    response.on("data", (chunk) => {
      responseData += chunk;
    });

    response.on("end", () => {
      if (response.statusCode === 200) {
        res.sendFile(path.join(__dirname, "success.html"));
      } else {
        console.error("Mailchimp error:", responseData);
        res.sendFile(path.join(__dirname, "failure.html"));
      }
    });
  });

  request.on("error", (err) => {
    console.error("Request error:", err);
    res.sendFile(path.join(__dirname, "failure.html"));
  });

  request.write(jsonData);
  request.end();
});

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
