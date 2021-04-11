const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const flow = require('./dialogflow.js');
require('dotenv').config();
// var express = require('express');
var morgan = require('morgan');
var mongoose = require('mongoose');
//body-parser will take request from user or you and parses it to the form that is required by the server such as get or post
//body-parser cannot handle multi-part data like image or video uploads
var bodyParser = require('body-parser');
var ejs = require('ejs');
var engine = require('ejs-mate');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var flash = require('express-flash');
//MongoStore is specifically to store session on server side
var MongoStore = require('connect-mongo/es5')(session);
var passport = require('passport');
const {
  usserJoin,
  getCurrentusser,
  usserLeave,
  getRoomussers
} = require('./utils/ussers');
var User = require('./models/user');
var eventCategory = require('./models/eventCategory');
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Squad Helpbot';

// Run when client connects
io.on('connection', socket => {
  socket.on('joinRoom', ({ ussername, room }) => {
    const usser = usserJoin(socket.id, ussername, room);

    socket.join(usser.room);

    // Welcome current usser
    socket.emit('message', formatMessage(botName, 'Welcome to the room!'));

    // Broadcast when a usser connects
    socket.broadcast
      .to(usser.room)
      .emit(
        'message',
        formatMessage(botName, `${usser.ussername} has joined the chat`)
      );

    // Send ussers and room info
    io.to(usser.room).emit('roomussers', {
      room: usser.room,
      ussers: getRoomussers(usser.room)
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage',(msg) => {
    const usser = getCurrentusser(socket.id);

    io.to(usser.room).emit('message', formatMessage(usser.ussername, msg));
    flow.dialog(msg).then((rep) => {
			if (rep != '') {
				console.log('Sending this reply:', rep);
				socket.emit('message', formatMessage(botName, rep));
			}
		});
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const usser = usserLeave(socket.id);

    if (usser) {
      io.to(usser.room).emit(
        'message',
        formatMessage(botName, `${usser.ussername} has left the chat`)
      );

      // Send ussers and room info
      io.to(usser.room).emit('roomussers', {
        room: usser.room,
        ussers: getRoomussers(usser.room)
      });
    }
  });
});

const PORT= 3000;

// server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//npx kill-port 3000
mongoose.connect(process.env.database, {useNewUrlParser: true, connectWithNoPrimary: true} , function(err){
  if(err){
    console.log(err);
  }else{
    console.log("Connected to the database");
  }
});

//Middleware
app.use(express.static(__dirname+'/public'));
app.use(morgan('dev')); //object of morgan
app.use(bodyParser.json()); // now our express application can parse json data also
app.use(bodyParser.urlencoded({extended:true}));// now our express application can parse x-www-form-urlencoded data also
app.use(cookieParser());
app.use(session({
  resave:true,
  saveUninitialized:true,
  cookie:{maxAge:3600*1000},
  secret:process.env.secretKey,
  store:new MongoStore({url: process.env.database,autoReconnect:true})
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// with the below function user data becomes accessible on all pages
app.use(function(req,res,next){
  res.locals.user = req.user;
  next();
});

// with the below function category data becomes accessible on all pages
app.use(function(req,res,next){
  //find all categories

  eventCategory
  .find({})
  .sort({ priority: -1 })
  .exec(function(err,eventCategories){
    if(err) return next(err);
    res.locals.eventCategories = eventCategories;
    next();
  });
});


app.engine('ejs',engine);
app.set('view engine','ejs'); // setting ejs as engine for our webpages

var mainRoutes = require('./routes/main');
var userRoutes = require('./routes/user');
// var adminRoutes = require('./routes/admin');
// var apiRoutes = require('./api/api');
app.use(mainRoutes);
app.use(userRoutes);
// app.use(adminRoutes);
// app.use('/api',apiRoutes);

//we can also write app.use('/batman',mainRoutes) but them the links would become 'batman/' and 'batman/about'


//this function is for starting the server
//3000 is the port no
//listen will work fine even without function(err)

// const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// app.listen(process.env.PORT,function(err){
//   if(err) throw err;
//   console.log("Server is Running on port "+ (process.env.PORT));
// });
