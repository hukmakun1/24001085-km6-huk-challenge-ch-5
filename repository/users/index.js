const crypto = require("crypto");
const path = require("path");
const bcrypt = require("bcrypt");
const { user } = require("../../models");
const { getData, setData, deleteData } = require("../../helper/redis");
const { uploader } = require("../../helper/cloudinary");

exports.createUser = async (payload) => {
  // encrypt the password
  payload.password = bcrypt.hashSync(payload.password, 10);

  // Create data to postgres
  if (payload.photo) {
    const { photo } = payload;
    photo.publicId = crypto.randomBytes(16).toString("hex");
    photo.name = `${photo.publicId}${path.parse(photo.name).ext}`;
    const photoUpload = await uploader(photo);
    payload.photo = photoUpload.secure_url;
  }

  // Save to db
  const data = await user.create(payload);

  // Save to redis (email & id)
  const keyID = `user:${data.id}`;
  await setData(keyID, data, 300);

  const keyEmail = `user:${data.id}`;
  await setData(keyEmail, data, 300);

  return data;
};

exports.getUserByID = async (id) => {
  const opt = {
    where: {
      id,
    },
  };
  const key = `user:${id}`;

  // get from redis
  let data = await getData(key);
  if (data) {
    return data;
  }

  // get from db
  data = await user.findAll(opt);
  if (data.length > 0) {
    // save to redis
    await setData(key, data[0], 300);

    return data[0];
  }

  throw new Error(`User is not found!`);
};

exports.getUserByEmail = async (email) => {
  const opt = {
    where: {
      email,
    },
  };
  const key = `user:${email}`;

  // get from redis
  let data = await getData(key);
  if (data) {
    return data;
  }

  // get from db
  data = await user.findAll(opt);
  if (data.length > 0) {
    // save to redis
    await setData(key, data[0], 300);

    return data[0];
  }

  throw new Error(`User is not found!`);
};
