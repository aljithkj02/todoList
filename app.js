const express = require('express');
const app = express();
const bodyPerser = require('body-parser');
const date = require(__dirname + '/date.js');
const mongoose = require('mongoose');
const _ = require('lodash');

mongoose.connect('mongodb+srv://admin-aljith:2002@todo.fvnvu.mongodb.net/Todo', { useNewUrlParser: true });
const day = date.getDate();
//
const todoSchema = mongoose.Schema({
    todoMsg: String
});
const Todo = mongoose.model('Todo', todoSchema);
//
const listSchema = mongoose.Schema({
    name: String,
    items: [todoSchema]
})
const List = mongoose.model('List', listSchema);
//

const item1 = new Todo({
    todoMsg: 'Welcome to your Todo List'
});
const item2 = new Todo({
    todoMsg: 'Hit the + button to Add a new Item'
});
const item3 = new Todo({
    todoMsg: '<-- Hit this to delete an item'
});

const defaultItems = [item1, item2, item3];




app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyPerser.urlencoded({ extended: true }));

app.get('/', (req, res) => {

    Todo.find({}, (err, foundItem) => {
        
        if (foundItem.length === 0) {
            Todo.insertMany(defaultItems, (err, data) => {
                if (err) {
                    console.log('Error!!!')
                    console.log(err)
                } else {
                    console.log('Successfully Stored!!!')
                    console.log(data)
                }
                res.redirect('/');
            })

        } else {
            res.render('list', { listTitle: day, newTodo: foundItem });

        }
        
    });
});


app.get('/:customList', (req, res) => {
    const listName = _.capitalize(req.params.customList);
    List.findOne({ name: listName }, (err, foundData) => {
        if (!err) {
            if (!foundData) {

                const newList = new List({
                    name: listName,
                    items: defaultItems
                });
                newList.save();
                res.redirect(`/${listName}`);

            } else {
                res.render('list', { listTitle: listName, newTodo: foundData.items })
            }
        }
    })

})



app.post('/', (req, res) => {
    let item = req.body.q;
    let listName = req.body.list;

    const newItem = new Todo({
        todoMsg: item
    })

    if (listName === day) {
        newItem.save();
        res.redirect('/');
    } else {
        List.findOne({ name: listName }, (err, foundData) => {
            foundData.items.push(newItem);
            foundData.save();
            res.redirect('/' + listName)
        })
    }


});

app.post('/delete', (req, res) => {
    const id = (req.body.checkBox).trim();
    const listName = (req.body.listName);
    if (listName === day) {
        Todo.findByIdAndRemove(id, (err, data) => {
            if (err) {
                console.log(err)
            } 
        })
        res.redirect('/')
    }else{
        List.findOneAndUpdate({name: listName},{$pull: {items: {_id: id}}},(err,result)=> {
            if(!err){
                res.redirect('/'+listName)
            }
        })
    }

})


app.get('/about', (req, res) => {
    res.render('about');
})


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, () => {
    console.log('Server has Started Successfully');
})