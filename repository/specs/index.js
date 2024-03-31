const crypto = require("crypto");
const path = require("path");
const { classes, spec } = require("../../models");
const { uploader } = require("../../helper/cloudinary");
const { getData, setData, deleteData } = require("../../helper/redis");

exports.getSpecs = async () => {
  const data = await spec.findAll(/* {
    include: {
      model: classes,
    },
  } */);
  return data;
};

exports.getSpec = async (id) => {
  const key = `specs:${id}`;

  // get from redis
  let data = await getData(key);
  if (data) {
    return data;
  }

  // get from db
  data = await spec.findAll({
    where: {
      id,
    },
    // include: {
    //   model: classes,
    // },
  });
  if (data.length > 0) {
    // save to redis
    await setData(key, data[0], 300);

    return data[0];
  }

  throw new Error(`Spec is not found!`);
};

exports.createSpec = async (payload) => {
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
  const data = await spec.create(payload);

  // save to redis
  const key = `specs:${data.id}`;
  await setData(key, data, 300);

  return data;
};

exports.updateSpec = async (id, payload) => {
  const key = `specs:${id}`;

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
  await spec.update(payload, {
    where: {
      id,
    },
  });

  // get from postgres
  const data = await spec.findAll({
    where: {
      id,
    },
    // include: {
    //   model: classes,
    // },
  });
  if (data.length > 0) {
    // save to redis
    await setData(key, data[0], 300);

    return data[0];
  }

  return data;
};

exports.deleteSpec = async (id) => {
  const key = `specs:${id}`;

  // delete from postgres
  await spec.destroy({ where: { id } });

  // delete from redis
  await deleteData(key);

  return null;
};
