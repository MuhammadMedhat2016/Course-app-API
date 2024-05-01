class APIFeatures {
    constructor(MongooseQuery, QueryStringObject) {
      this.MongooseQuery = MongooseQuery;
      this.QueryStringObject = QueryStringObject;
    }
    filter() {
      const excludedFields = ['page', 'fields', 'sort', 'limit'];
      // Filtering
      let filterData = { ...this.QueryStringObject };
      excludedFields.forEach((feature) => delete filterData[feature]);
  
      // Advanced Filtering
      let filterStr = JSON.stringify(filterData);
      // four supported operators in QS lt, lte, gt, gte
      filterStr = filterStr.replace(
        /\b(gte|gt|lte|lt)\b/g,
        (match) => `$${match}`
      );
      filterData = JSON.parse(filterStr);
      // add the a condition to the filter object to mongoose query object
      this.MongooseQuery = this.MongooseQuery.find(filterData);
      return this;
    }
  
    sort() {
      if (this.QueryStringObject.sort) {
        const sortBy = this.QueryStringObject.sort.split(',').join(' ');
        this.MongooseQuery = this.MongooseQuery.sort(sortBy);
      } else {
        this.MongooseQuery = this.MongooseQuery.sort('-createdAt');
      }
      return this;
    }
    select() {
      if (this.QueryStringObject.fields) {
        const projectFields = this.QueryStringObject.fields.split(',').join(' ');
        this.MongooseQuery = this.MongooseQuery.select(projectFields);
      } else {
        this.MongooseQuery = this.MongooseQuery.select('-__v');
      }
      return this;
    }
    paginate() {
      const page = this.QueryStringObject.page || 1;
      const limit = this.QueryStringObject.limit || 100;
      const skip = (page - 1) * limit;
      this.MongooseQuery = this.MongooseQuery.skip(skip).limit(limit);
      return this;
    }
  }
  
  module.exports = APIFeatures