const { cars } = require("../../models");
const { getData, setData, deleteData } = require("../../helper/redis");

exports.getCars = async () => {
  const data = await cars.findAll(/* {
    include: {
      model: ["options"],
    },
  } */);
  if (!data || data.length == 0) {
    throw { message: "Not Cars Found" };
  }
  return data;
};

exports.getCar = async (id) => {
  const key = `cars:${id}`;

  // check redis and if there are any data return data from redis
  let data = await getData(key);
  if (data) {
    return data;
  }

  // if in the redis not found, we will get from database (postgres) and then save it to redis
  data = await cars.findAll({
    where: {
      id,
    },
    // include: {
    //   model: options,
    // },
  });
  if (data.length > 0) {
    // save in the redis if in the postgres is found
    await setData(key, data[0], 300);

    return data[0];
  }

  throw new Error(`Cars is not found!`);
};

exports.createCar = async (payload) => {
  // Create data to postgres

  const data = await cars.create(payload);

  // Save to redis (cache)
  const key = `cars:${data.id}`;
  await setData(key, data, 300);

  return data;
};

exports.updateCar = async (id, payload) => {
  const key = `cars:${id}`;

  // update data to postgres
  await cars.update(payload, {
    where: {
      id,
    },
  });

  // get data from postgres
  const data = await cars.findAll({
    where: {
      id,
    },
    // include: {
    //   model: student,
    // },
  });
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
