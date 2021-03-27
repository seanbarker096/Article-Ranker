// const User = require('../models/userModel');
// const AppError = require('../utils/appError');
// const catchAsync = require('../utils/catchAsync');
// const factory = require('./handlerFactory');

// const filterObj = (obj, filterArr) => {
//     const filteredObj = {};
//     Object.keys(obj).forEach((key) => {
//         if (filterArr.includes(key)) filteredObj[key] = obj[key];
//     });
//     return filteredObj;
// };
// exports.getUsers = factory.getMany(User, { limit: 50 });

// exports.getUser = factory.getOne(User, true);

// exports.deleteUser = factory.deleteOne(User);

// exports.getMe = catchAsync(async (req, res, next) => {
//     //set params so can then just normal getUser handler
//     req.params.id = req.user._id;
//     next();
// });

// exports.requireAdmin = (req, res, next) => {
//     if (req.user.role !== 'admin') {
//         return next(new AppError('You are not authorized to do this.', 401));
//     }
//     next();
// };

// exports.updateUser = catchAsync(async (req, res, next) => {
//     if (req.body.password || req.body.passwordConfirm) {
//         return next(
//             new Error('This route cannot be used to update passwords', 200)
//         );
//     }
//     //filter only fields that are allowed to be changed in this function
//     const allowedFields = ['name', 'photo'];
//     const filteredObj = filterObj(req.body, allowedFields);
//     const updatedUser = await User.findByIdAndUpdate(
//         req.user._id,
//         filteredObj,
//         {
//             new: true,
//         }
//     );
//     if (!updatedUser)
//         return next(
//             new AppError('Could not update user as user was not found')
//         );

//     res.status(200).send({
//         status: 'success',
//         data: {
//             updatedUser,
//             updatedFields: Object.keys(filteredObj),
//         },
//     });
// });

// exports.getUserActivity = catchAsync(async (req, res, next) => {});

// exports.getUserStats = catchAsync(async (req, res, next) => {});

const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

const filterObj = (obj, filterArr) => {
    const filteredObj = {};
    Object.keys(obj).forEach((key) => {
        if (filterArr.includes(key)) filteredObj[key] = obj[key];
    });
    return filteredObj;
};
exports.getUsers = factory.getMany(User, { limit: 10 });

exports.getUser = catchAsync(async (req, res, next) => {
    let user = await User.findById(req.params.id);
    if (!user) return next(new AppError('Document does not exist', 400));
    user = await user.populateChildren();
    res.status(200).json({
        status: 'success',
        data: {
            user,
        },
    });
});

exports.deleteUser = factory.deleteOne(User);

exports.getMe = catchAsync(async (req, res, next) => {
    //set params so can then just normal getUser handler
    req.params.id = req.user._id;
    next();
});

exports.requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return next(new AppError('You are not authorized to do this.', 401));
    }
    next();
};

exports.updateUser = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new Error('This route cannot be used to update passwords', 200)
        );
    }
    //filter only fields that are allowed to be changed in this function
    const allowedFields = ['name', 'photo'];
    const filteredObj = filterObj(req.body, allowedFields);
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        filteredObj,
        {
            new: true,
        }
    );
    if (!updatedUser)
        return next(
            new AppError('Could not update user as user was not found')
        );

    res.status(200).send({
        status: 'success',
        data: {
            doc: updatedUser,
            updatedFields: Object.keys(filteredObj),
        },
    });
});

exports.getUserActivity = catchAsync(async (req, res, next) => {
    const userId = req.params.id;
    const userActivity = await User.getActivity(userId);
    res.status(200).json({
        status: 'success',
        data: {
            userActivity,
        },
    });
});

exports.getUserStats = catchAsync(async (req, res, next) => {
    const userStats = await User.getUserStats(req.params.id);
    res.status(200).json({
        status: 'success',
        userStats,
    });
});
