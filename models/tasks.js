const mongoose = require('mongoose');

const tasksSchema = mongoose.Schema({
    content : {
        type:String
    },
    done : {
        type:Boolean, default:false
    },
    listId : {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'list'
    }
});

module.exports = mongoose.model('Task' , tasksSchema);