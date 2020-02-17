// Déclarations des dépendances

const express = require('express'),
bodyParser    = require('body-parser'),
mongoose      = require('mongoose'),
bcrypt        = require('bcrypt'),
jwt           = require('jsonwebtoken'),
// cors = require('cors'),
app           = express(); 
    
    // parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(cors());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Headers', "Origin, X-Requested-With, Content-Type, Accept, X-Access-Token");
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});
    
    // Initialisation de la connexion a la base de données
mongoose.connect('mongodb://localhost/todoList', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
});
    // Mise en écoute de notre application (sur le port 3000)
    

// Récuperation des models
let User = require('./models/user');
let List = require('./models/list');
let Task = require('./models/tasks');

// Déclarations des routes de notre application
app.route('/').get(function(req, res) {
    res.send('hello world !');
});


//================USER================================
app.route('/register').post(function(req, res) {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    bcrypt.hash(password, 10 , (err , hash)=>{
        let user = new User({name: name, email: email, password: hash});
        
        user.save()
        .then((user) => {
            res.status(200).json(user);
        })
        .catch(err => {
            res.status(400).json(err);
            // console.warn(err)
        })
    })
});
app.route('/login').post(function(req, res){
    const email = req.body.email;
    const password = req.body.password;
    
    User.findOne({email})
    .then(user =>{
        bcrypt.compare(password , user.password)
            .then(result =>{
                if(result){
                    let token = jwt.sign({id: user.id},'maclefsecrete');
                    // let response = { user: user.name  }
                    res.status(200).json({"token": token, "name":user.name});
                    // res.send(response)
                }
                else
                    res.status(403).json('identifiants incorrects');
            });
    })
    .catch( ()=> {
        res.status(403).json('identifiants incorrects');
    });
});

//==================user-list==================

//add list
app.route('/list').post((req,res)=>{

    jwt.verify(req.headers["x-access-token"], "maclefsecrete", (err, decoded)=> {

        if (err){
            res.send(err)
        }
        else {
            const title = req.body.title;
            const list = new List({ title: title });

            User.findOne({ _id : decoded.id })
                .then(user => {
                    user.lists.push(list);
                    user.save()
                        .then(() => {
                            list.save()
                                .then(() => {
                                    res.send(user);
                                })
                                .catch((err) => {
                                    res.status(400).json(err)
                                })
                        })
                })
                .catch(err => {
                    res.status(500).json(err);
                })
        }
    })
});

//delete lists with their tasks
app.route('/list').delete((req, res) => {

    jwt.verify(req.headers["x-access-token"], "maclefsecrete", (err, decoded) => {

        if (err) {
            res.send(err)
        }
        else {
            const _id = req.body._id;

            User.findOne({ _id: decoded.id })
                .then( () => {
                    Task.deleteMany({listId : _id})
                        .then(()=>{
                            List.findByIdAndRemove({_id : _id})
                            .then((list)=>{
                                // User.findByIdAndRemove({ lists: _id })
                                res.send(list)
                            })
                        })
                })
                .catch(err => {
                    res.status(500).json(err);
                })
        }
    })
});

// create tasks
app.route('/task').post((req,res)=>{

    jwt.verify(req.headers["x-access-token"], "maclefsecrete", (err, decoded) => {
        if(err){
            res.send(err);
        }
        else {
            User.findOne({_id: decoded.id})
                .then(() =>{
                    const _id = req.body._id;
                    const content = req.body.content;
                    const task = new Task({ content: content, listId: _id });
                    List.findOne({ _id })
                        .then(list => {
                            list.tasks.push(task);
                            list.save().then(() => {
                                task.save().then(() => {
                                    res.send(list);
                                })
                            })
                        })
                })
        }
    })
})
//update task
app.route('/task').put((req, res) => {

    jwt.verify(req.headers["x-access-token"], "maclefsecrete", (err, decoded) => {
        if (err) {
            res.send(err);
        }
        else {
            User.findOne({ _id: decoded.id })
            const _id = req.body._id;
        
            Task.findByIdAndUpdate({ _id },{$set : {done : true}})
                .then((task) => {
                    res.json(task);
                })
        }
    })
})
// delete task
app.route('/task').delete((req, res) => {

    jwt.verify(req.headers["x-access-token"], "maclefsecrete", (err, decoded) => {
        if (err) {
            res.send(err);
        }
        else {
            User.findOne({ _id: decoded.id })
            const _id = req.body._id;

            Task.findByIdAndRemove({ _id })
            .then((task) => {
                res.send(`the ${task.content} was deleted`)
            })
            .catch(err => {
            res.send('error task not found');
            })
        }
    })
       
})



// get user with list
app.route('/user').get((req,res)=> {

    jwt.verify(req.headers["x-access-token"], "maclefsecrete", (err, decoded)=> {
        if(err){
            res.status(204).json('user not found')
        }
        else {
            // const _id = req.params._id
            User.findOne({ _id: decoded.id },{password:0, email:0}).populate('lists')
                .then(user => {
                    res.status(200).send(user);
                })
                .catch(err => {
                    res.status(204).send(err);
                })
        }
    })

});

// get lists with tasks
app.route('/list/:_id').get((req, res) => {


    jwt.verify(req.headers["x-access-token"], "maclefsecrete", (err, decoded) => {
        if (err) {
            res.status(204).json('user not found')
        }
        else {
            
            User.findOne({ _id: decoded.id }, { password: 0, email: 0 }).populate('lists')
            const _id = req.params._id;

            List.findOne({ _id }, { _id: 0, title: 0 }).populate('tasks')
                .then(list => {
                    res.send(list);
                })
        }
    })
})


app.listen(3050, () => {
    console.log('connected to port 3050');
});