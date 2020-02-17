const mongoose = require('mongoose');

let listSchema = new mongoose.Schema ({
    title: { type: String, required: 'You need to specifie a list'},
    tasks : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Task'
    }]
})

// listSchema.pre('findByIdAndDelete', (next) => {
//     // let id = this.getQuery()["_id"];
//     this.model('List').deleteMany({tasks : this._id}, next)
// });

module.exports = mongoose.model('List', listSchema);