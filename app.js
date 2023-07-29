const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const sequelize=require('./util/database');
const Product=require('./models/product')
const User=require('./models/user')
const Cart=require('./models/cart')
const CartItem=require('./models/cartItem')

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');




app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req,res,next)=>{
    User.findOne({where:{id:1}})
    .then(user=>{
        req.user=user;
        next();
    })
    .catch(err=>console.log(err));
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);


Product.belongsTo(User,{constraints:true, onDelete:'CASCADE'});
User.hasMany(Product);
User.hasOne(Cart)
Cart.belongsTo(User)
Product.belongsToMany(Cart, {through:CartItem})
Cart.belongsToMany(Product,{through:CartItem})

sequelize
.sync()
.then(result=>{ 
 return  User.findOne({where:{id:1}});
})
.then(user=>{
    if(!user){
        return User.create({name:'max',email:'test@test.com'})
    }
    return user 
})
.then(user=>{
    if(!Cart)
    return user.createCart()
 
   
})
.then(user=>{
    app.listen(4000);
    console.log('server running at port 4000')
})
.catch(err=>{
    console.log(err);
})


