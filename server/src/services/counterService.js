const Counter = require("../models/Counter");
const Request = require("../models/Request");


const getNextSequence = async (
  counterName
) => {

  if (
    counterName === "request"
  ) {

    const existingCounter =
      await Counter.findOne({
        name: counterName,
      });


    const latestRequest =
      await Request.findOne()
        .sort({
          requestId: -1,
        })
        .select("requestId");


    let latestSequence = 0;


    if (
      latestRequest?.requestId
    ) {

      const match =
        latestRequest.requestId.match(
          /^REQ-(\d+)$/
        );


      if (match) {

        latestSequence =
          Number(match[1]);

      }

    }


    if (
      existingCounter &&
      existingCounter.sequence <
        latestSequence
    ) {

      existingCounter.sequence =
        latestSequence;

      await existingCounter.save();

    }


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

  }


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