require('dotenv').config();
const {createServer} = require("http");
const {Server} = require("socket.io");

const connection = require("./Connection").connection;
const httpServer = createServer();

const tracker = new Map();
let full = false;
let q = [];
let cut = 0;

let latest = new Date('2022-03-27T05:35:30.728Z');


const poll = () => {
    console.log("POLLING...")
    try{
        connection.query(`SELECT * FROM events WHERE created_at > ${connection.escape(latest)} ORDER BY created_at DESC;`, async (error, results, fields) => {
            if(error) throw error;
            console.log(results)
            if(results.length > 0) {
                console.log("FRESH DATA", results.length)
                latest = results[0].created_at;
                q.push(...results)
                cut = Math.floor(q.length / tracker.size);
                await assignWork();
            }
        })
    }catch(e){
        console.error(e)
    }
}

setInterval(() => {
        poll();
}, [process.env.POLL_PERIOD])
    
    

const io = new Server(httpServer, {
  // options
});

const endPoint = io.of("/live")

endPoint.on('connection', async (socket) => {
    console.log("NEW CONNECTION", socket.id)
    tracker.set(socket.id, {
        busy: false,
        socket: socket
    })
    
    
    full = false;
    await assignWork();
    socket.on("work_done", async () => {
        tracker.set(socket.id, {
            busy: false, 
            socket: socket
        })
        full = false;
        await assignWork();
    })
})


const getAvailableSocket  = async () => {
    const iterator = tracker[Symbol.iterator]();
    for(const item of iterator){
        if(!item[1].busy){
            return item
        }
    }
}


const assignWork = async () => {
   if(q.length > 0){
    if(!full){
            let s = await getAvailableSocket();
            if(s){
                s[1].socket.emit("work",q.splice(q.length - cut, q.length)  );
                tracker.set(s[0], {busy: true, socket: s[1].socket})
                assignWork();
            } else full = true; 
    }
   } 
}

httpServer.listen(3000, "localhost")