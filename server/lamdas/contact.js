// Node modules
import express from "express";
import bodyParser from "body-parser";
import mongoose from "../lib/mongoose";
import nodemailer from "nodemailer";
import Email from "email-templates";
import path from "path";

//Load contact model
import Contact from "../models/Contact";

// Load input validation
import validateContactInput from "../validation/contact";

const app = express();

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// View engine setup
app.set("view engine", "pug");
app.set("views", "../");

// @route Get api/posts/test
// @desc Tests post route
// @access Public
app.post("*", async (req, res) => {
  const { errors, isValid } = validateContactInput(req.body);
  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  await mongoose();
  const newContact = new Contact({
    email: req.body.email,
    tel: req.body.tel
  });
  newContact
    .save()
    .then(contact => {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: "synapseprep@gmail.com",
          pass: `${process.env.EMAIL_PASSWORD}`
        }
      });
      const email = new Email({
        transport: transporter,
        message: {
          subject: "Hey, We'll Call You Soon",
          from: "support@synapseprep.net"
        },
        // uncomment below to send emails in development/test env:
        send: true
      });

      email
        .send({
          template: path.join(__dirname, "..", "emails"),
          message: {
            to: `${contact.email}`
          },
          locals: {
            title: "We'll Call You Soon!",
            message:
              "We're super excited you visited us and look forward to chatting within 48hrs.  You're also welcome to reply to this message if you'd rather communicate via email."
          }
        })
        .then(email => {
          res.status(200).send(email);
        })
        .catch(console.error);
    })
    .catch(err => console.log(err));
});

export default app;
