const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(express.static("public"));     //to upload css files through public folder

const mongoose= require("mongoose");

mongoose.set('strictQuery', true);
mongoose.connect("mongodb://127.0.0.1/todolistDB");
const itemSchema={
    name: String
};

const Item = mongoose.model("Item", itemSchema); 

const item1 = new Item({
    name: "Welcome"
});
const item2 = new Item({
    name: "Hit the + button to add a new item"
});
const item3 = new Item({
    name: "<--Hit this to delete an item"
});

const defaultItems=[item1, item2, item3];
// Item.insertMany([item1, item2, item3], function(err){
//     if(err)
//         console.log(err);
//     else
//         console.log("These items were inserted successfully");
// })

const customListSchema={
    name: String,
    list: [itemSchema]
}

const CustomList = mongoose.model("customList", customListSchema);

app.get("/:customListName", function(req, res){
    const customListName = req.params.customListName;
    
    
    CustomList.findOne({name: customListName}, function(err, results){
        if(results){
            res.render("lists", {listTitle: results.name, item: results.list});
        }  
        else{
            const list1= new CustomList({
                name: customListName,
                list: defaultItems
            });
            list1.save();
            res.redirect("/"+ customListName);
        }
    })
})

app.get("/", function(req, res){
    var today = new Date();
    var currentday = today.getDay();

    var options = {
        weekday : "long",
        day: "numeric",
        month: "long"
    };
    var day = today.toLocaleDateString("en-US", options);

    Item.find({}, function(err, foundItems){
        if(foundItems.length===0){
            if(err)
                console.log(err);
            else{
                Item.insertMany(defaultItems, function(err){});
                res.redirect("/");
            }
        }
        else{
            res.render("lists", {listTitle: "today", item: foundItems});
        }
            
    });
    
})

app.post("/", function(req, res){

    var today = new Date();
    var currentday = today.getDay();

    var options = {
        weekday : "long",
        day: "numeric",
        month: "long"
    };
    var day = today.toLocaleDateString("en-US", options);
    console.log(req.body.list);


    const itemName = req.body.newItem;
    const item = new Item({
        name: itemName
    });
    
    if(req.body.list==="today"){
        
        item.save();
        res.redirect("/"); 
    }
    else{
        CustomList.findOne({name:req.body.list}, function(err, results){
            results.list.push(item);
            results.save();
            res.redirect("/"+results.name);
        })
    }

    
})

app.post("/delete", function (req, res) { 
    const checkedItemId=req.body.checkbox;
    console.log(req.body);
    if(req.body.listTitle==="today"){
        Item.findByIdAndRemove(checkedItemId, function(err){
            if(err)
                console.log(err);
            else
                console.log("Item removed successfully");
            res.redirect("/");
        })
    }   
    else{
        CustomList.findOneAndUpdate({name: req.body.listTitle}, {$pull:{list: {_id: checkedItemId}}}, function(err){
            if(!err)
                res.redirect("/"+req.body.listTitle);
        })
    }
 })

app.get("/work", function(req, res){
    res.render("lists", {listTitle: "work list", item: workItems});
})

app.get("/about", function(req, res){
    res.render("about");
})

app.listen(3000, function(){
    console.log("starting server on port 3000");
})