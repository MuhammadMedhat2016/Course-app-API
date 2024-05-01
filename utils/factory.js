const catchAsyncErrors = require('./catchAsyncErrors');
const APIError = require('./apiError');
const APIFeatures = require('./apiFeatures');
const factory = {
  deleteOne: (Model) =>
    catchAsyncErrors(async (req, res, next) => {
      const id = req.params.id;
      const doc = await Model.findByIdAndDelete(id);
      if (!doc) {
        return next(new APIError(`No document found with this id ${id}`, 404));
      }
      res.status(204).json({
        status: 'success',
      });
    }),
  updateOne: (Model) =>
    catchAsyncErrors(async (req, res, next) => {
      const id = req.params.id;
      const doc = await Model.findOneAndUpdate({ _id: id }, req.body, {
        new: true,
        runValidators: true,
      });
      if (!doc) {
        return next(new APIError(`No document found with this id ${id}`, 404));
      }
      res.status(200).json({
        status: 'success',
        data: {
          data: doc,
        },
      });
    }),
  createOne: (Model) =>
    catchAsyncErrors(async (req, res, next) => {
      const data = req.body;
      const doc = await Model.create(data);
      res.status(201).json({
        status: 'success',
        data: {
          data: doc,
        },
      });
    }),
  getOne: (Model, popOptions) =>
    catchAsyncErrors(async (req, res, next) => {
      const id = req.params.id;
      features = new APIFeatures(Model.findById(id), req.query).select();
      const doc = await features.MongooseQuery.populate(popOptions);
      if (!doc) {
        return next(new APIError(`No document found with this id ${id}`, 404));
      }
      res.status(200).json({
        status: 'success',
        data: {
          data: doc,
        },
      });
    }),
  getAll: (Model) =>
    catchAsyncErrors(async (req, res, next) => {
      const features = new APIFeatures(Model.find({}), req.query);
      features.filter().sort().paginate().select();
      const docs = await features.MongooseQuery;
      res.status(200).json({
        status: 'success',
        data: {
          length: docs.length,
          data: docs,
        },
      });
    }),
};

module.exports = factory;
