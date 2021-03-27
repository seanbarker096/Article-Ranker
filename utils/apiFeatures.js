//receives a mongoose query object (query) and the original query object (req.query). Several methods for filtering,
//limiting etc.
//Returns the APIFeatures object. Can then access query property and await to execute query
class APIFeatures {
    constructor(query, queryObj) {
        this.queryObj = { ...queryObj };
        //intialise query
        this.query = query;
    }

    //IF USING THEN MUST BE CALLED FIRST
    filter() {
        //remove fields for pagination, sroting and limiting in req.query, which go in the options
        //object for mongo query, not the filter object
        //if dont remove then mongo will look for properties with this name
        const queryObj = { ...this.queryObj }; //create copy do remove from this.queryObj which other methods sue
        const exludedFields = ['sort', 'page', 'limit', 'fields'];
        exludedFields.forEach((el) => delete queryObj[el]);
        //convert to JSON string so can use regex to add mongo operators to query string
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(
            /\b(gte|lte|lt|gt)\b/g,
            (match) => `$${match}`
        );

        //replace previous query object
        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    sort() {
        if (this.queryObj.sort) {
            //assuming all sort fields seperated by comma
            const sortBy = this.queryObj.sort.split(',').join(' ');
            //chain on new method
            this.query = this.query.sort(sortBy);
        }
        return this;
    }

    limit() {
        if (this.queryObj.fields) {
            const fields = this.queryObj.fields.split(',').join(' ');
            //chain on new method
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }
        return this;
    }

    paginate() {
        const page = this.queryObj.page * 1 || 1;
        const limit = this.queryObj.limit * 1 || 100;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);
        // if (this.queryObj.page) {
        //     const docCount = await this.model.countDocuments();
        //     if (skip >= docCount) {
        //         throw AppError('This page does not exist', 400);
        //     }
        // }
        return this;
    }
}

module.exports = APIFeatures;
