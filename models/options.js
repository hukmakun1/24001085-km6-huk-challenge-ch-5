"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class options extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      options.belongsTo(models.cars, { foreignKey: "car_id" });
    }
  }
  options.init(
    {
      name: DataTypes.STRING,
      car_id: DataTypes.INTEGER,
      deletedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "options",
      paranoid: true,
    }
  );
  return options;
};
