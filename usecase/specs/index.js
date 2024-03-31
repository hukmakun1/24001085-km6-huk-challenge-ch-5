const specRepo = require("../../repository/specs");

exports.getSpecs = async () => {
  const data = await specRepo.getSpecs();
  return data;
};

exports.getSpec = async (id) => {
  const data = await specRepo.getSpec(id);
  return data;
};

exports.createSpec = async (payload) => {
  const data = await specRepo.createSpec(payload);
  return data;
};

exports.updateSpec = async (id, payload) => {
  // update old data
  await specRepo.updateSpec(id, payload);

  // find the new data
  const data = await specRepo.getSpec(id);

  return data;
};

exports.deleteSpec = async (id) => {
  const data = await specRepo.deleteSpec(id);
  return data;
};
