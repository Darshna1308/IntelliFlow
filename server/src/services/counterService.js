const Counter = require("../models/Counter");

const getNextSequence = async (
  counterName
) => {
  const counter =
    await Counter.findOneAndUpdate(
      {
        name: counterName,
      },
      {
        $inc: {
          sequence: 1,
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

  return counter.sequence;
};

module.exports = {
  getNextSequence,
};