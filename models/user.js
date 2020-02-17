const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');

let userSchema = new mongoose.Schema({
    name: {
        type: 'string',
        required: 'You need to specifie a name'
    },
    email: {
        type: 'string',
        unique: true,
        required: 'You need to specifie a email',
    },
    password: {
        type: 'string',
        required: 'You need to specifie a password'
    },
    lists: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'List'
    }]
    
});

// userSchema.pre('save', (next)=> {
//     bcrypt.hash(password , 10 , (err , hash)=>{
//         hash = password;
//         next();
//     })
// })


module.exports = mongoose.model('User', userSchema);
