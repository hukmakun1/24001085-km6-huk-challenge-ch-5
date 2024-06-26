const jsonwebtoken = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {
  createUser,
  getUserByID,
  getUserByEmail,
} = require("../../repository/users");

exports.register = async (payload) => {
  const user = await createUser(payload);

  //   Delete object password from user
  delete user.dataValues.password;

  // create token
  const jwtPayload = {
    id: user.id,
  };
  const token = jsonwebtoken.sign(jwtPayload, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  //   return the user data and token
  const data = {
    user,
    token,
  };

  return data;
};

exports.login = async (email, password) => {
  // get the user
  let user = await getUserByEmail(email);
  if (!user) {
    throw new Error("User is not found!");
  }

  // compare
  const isValid = await bcrypt.compare(password, user?.password);
  if (!isValid) {
    throw new Error("Wrong Password");
  }

  // delete password
  if (user?.dataValues?.password) {
    delete user?.dataValues?.password;
  } else {
    delete user?.password;
  }

  // create token
  const jwtPayload = {
    id: user.id,
  };
  const token = jsonwebtoken.sign(jwtPayload, process.env.JWT_SECRET, {
    expiresIn: "5h",
  });

  //   return the user data and token
  const data = {
    user,
    token,
  };

  return data;
};

exports.profile = async (id) => {
  // get the user
  let data = await getUserByID(id);
  if (!data) {
    throw new Error(`User is not found!`);
  }

  // delete password
  if (data?.dataValues?.password) {
    delete data?.dataValues?.password;
  } else {
    delete data?.password;
  }

  return data;
};
