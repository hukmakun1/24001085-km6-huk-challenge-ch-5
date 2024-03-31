const crypto = require("crypto");
const path = require("path");
const { cars, option } = require("../../models");
const { uploader } = require("../../helper/cloudinary");
const { getData, setData, deleteData } = require("../../helper/redis");

exports.getOptions = async () => {
  const data = await option.findAll(/* {
    include: {
      model: cars,
    },
  } */);
  return data;
};

exports.getOption = async (id) => {
  const key = `options:${id}`;

  // get from redis
  let data = await getData(key);
  if (data) {
    return data;
  }

  // get from db
  data = await option.findAll({
    where: {
      id,
    },
    // include: {
    //   model: cars,
    // },
  });
  if (data.length > 0) {
    // save to redis
    await setData(key, data[0], 300);

    return data[0];
  }

  throw new Error(`Options is not found!`);
};

exports.createOption = async (payload) => {
  if (payload.photo) {
    // upload image to cloudinary
    const { photo } = payload;

    // make unique filename -> 213123128uasod9as8djas
    photo.publicId = crypto.randomBytes(16).toString("hex");

    // rename the file -> 213123128uasod9as8djas.jpg / 213123128uasod9as8djas.png
    photo.name = `${photo.publicId}${path.parse(photo.name).ext}`;

    // Process to upload image
    const imageUpload = await uploader(photo);
    payload.photo = imageUpload.secure_url;
  }

  // save to db
  const data = await option.create(payload);

  // save to redis
  const key = `options:${data.id}`;
  await setData(key, data, 300);

  return data;
};

exports.updateOption = async (id, payload) => {
  const key = `options:${id}`;

  if (payload.photo) {
    // upload image to cloudinary
    const { photo } = payload;

    // make unique filename -> 213123128uasod9as8djas
    photo.publicId = crypto.randomBytes(16).toString("hex");

    // rename the file -> 213123128uasod9as8djas.jpg / 213123128uasod9as8djas.png
    photo.name = `${photo.publicId}${path.parse(photo.name).ext}`;

    // Process to upload image
    const imageUpload = await uploader(photo);
    payload.photo = imageUpload.secure_url;
  }

  // update to postgres
  await option.update(payload, {
    where: {
      id,
    },
  });

  // get from postgres
  const data = await option.findAll({
    where: {
      id,
    },
    // include: {
    //   model: cars,
    // },
  });
  if (data.length > 0) {
    // save to redis
    await setData(key, data[0], 300);

    return data[0];
  }

  return data;
};

exports.deleteOption = async (id) => {
  const key = `options:${id}`;

  // delete from postgres
  await option.destroy({ where: { id } });

  // delete from redis
  await deleteData(key);

  return null;
};
