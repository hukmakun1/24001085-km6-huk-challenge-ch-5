const crypto = require("crypto");
const path = require("path");
const { cars, options, specs } = require("../../models");
const { getData, setData, deleteData } = require("../../helper/redis");
const { uploader } = require("../../helper/cloudinary");

exports.getCars = async () => {
  const opt = {
    include: [
      {
        model: options,
      },
      {
        model: specs,
      },
    ],
  };
  const data = await cars.findAll(opt);
  if (!data || data.length == 0) {
    throw { message: "Not Cars Found" };
  }
  return data;
};

exports.getCar = async (id) => {
  const opt = {
    where: {
      id,
    },
    include: [
      {
        model: options,
      },
      {
        model: specs,
      },
    ],
  };
  const key = `cars:${id}`;

  // check redis and if there are any data return data from redis
  let data = await getData(key);
  if (data) {
    return data;
  }

  // if in the redis not found, we will get from database (postgres) and then save it to redis
  data = await cars.findAll(opt);
  if (data.length > 0) {
    // save in the redis if in the postgres is found
    await setData(key, data[0], 300);

    return data[0];
  }

  throw new Error(`Cars is not found!`);
};

exports.createCar = async (payload) => {
  // Create data to postgres
  if (payload.image) {
    const { image } = payload;
    image.publicId = crypto.randomBytes(16).toString("hex");
    image.name = `${image.publicId}${path.parse(image.name).ext}`;
    const imageUpload = await uploader(image);
    payload.image = imageUpload.secure_url;
  }

  const data = await cars.create(payload);

  // Save to redis (cache)
  const key = `cars:${data.id}`;
  await setData(key, data, 300);

  return data;
};

exports.updateCar = async (id, payload) => {
  const opt = {
    where: {
      id,
    },
    include: [
      {
        model: options,
      },
      {
        model: specs,
      },
    ],
  };
  const key = `cars:${id}`;

  // update data to postgres
  await cars.update(payload, {
    where: {
      id,
    },
  });

  // get data from postgres
  const data = await cars.findAll(opt);
  if (data.length > 0) {
    // save to redis (cache)
    await setData(key, data[0], 300);

    return data[0];
  }

  throw new Error(`Car is not found!`);
};

exports.deleteCar = async (id) => {
  const key = `cars:${id}`;

  // delete from postgres
  await cars.destroy({ where: { id } });

  // delete from redis
  await deleteData(key);

  return null;
};
