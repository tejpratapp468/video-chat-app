const app = require("express")();
const server = require("http").createServer(app);//creating a server
const cors = require("cors");

//sockets are used for real time data transmission
const io = require("socket.io")(server, {
	cors: {
		origin: "*", //this allows access from all origins
		methods: [ "GET", "POST" ]
	}
});

app.use(cors());

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
	res.send('Server is Running');
});

io.on("connection", (socket) => {
	//socket handlers
    
	//this will emit the id and we will get it on frontend(), id is the id of specific socket
	socket.emit("me", socket.id);//we emit 'me' msg bcz i joined then we pass socket.id this will give our own id on frontend side as soonas connection is open

	socket.on("disconnect", () => {
		socket.broadcast.emit("callEnded") //broadcasting msg
	});

	socket.on("callUser", ({ userToCall, signalData, from, name }) => { //this data is coming from fronend
		io.to(userToCall).emit("callUser", { signal: signalData, from, name }); //we will emit call user and the data
	}); //signal:signalData represents signal strength

	socket.on("answerCall", (data) => {
		io.to(data.to).emit("callAccepted", data.signal)
	});
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
