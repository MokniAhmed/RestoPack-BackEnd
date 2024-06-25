const nodemailer = require("nodemailer");
const config = require("./auth.config");

const user = config.user;
const pass = config.pass;

const transport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: user,
    pass: pass,
  },
});

module.exports.sendConfirmationEmailC = (fullName, email, confirmationCode) => {
  transport
    .sendMail({
      from: user,
      to: email,
      subject: "Veuillez confirmer votre compte",
      html: `<h1>Email Confirmation</h1>
        <h2> Bienvenu ${fullName}</h2>
        <p>Merci de vous être inscrit. Veuillez confirmer votre email en cliquant sur <a href=http://localhost:3000/active/${confirmationCode}> ce lien</a></p>
    
        </div>`,
    })
    .catch((err) => console.log(err));
};

module.exports.resetPasswordEmailC = (fullName, email, confirmationCode) => {
  transport
    .sendMail({
      from: user,
      to: email,
      subject: "mot de passe oublié",
      html: `<h1>reset password</h1>
        <h2> Bienvenu ${fullName}</h2>
        <p> Veuillez confirmer votre email en cliquant sur <a href=http://localhost:3000/forget3/${confirmationCode}> ce lien</a></p>
    
        </div>`,
    })
    .catch((err) => console.log(err));
};
