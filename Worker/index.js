const {io} = require("socket.io-client")
const { initializeApp } = require("firebase/app");
const { getDatabase, ref,  set,push, increment} = require("firebase/database");

const firebaseConfig = {
    apiKey: "AIzaSyBXm0bTxuGwQMAEcBuQHiHrG8jLfkE5tSo",
    authDomain: "greendeck-6a33b.firebaseapp.com",
    databaseURL: "https://greendeck-6a33b-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "greendeck-6a33b",
    storageBucket: "greendeck-6a33b.appspot.com",
    messagingSenderId: "267591426271",
    appId: "1:267591426271:web:37cdcbc840a41e1067496a"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase();

const socket = io('http://localhost:3000/live');

socket.on('work', (p) => {
    const promise = new Promise((res, rej) => {
        p.map(async (data) => {
            await work(data.event)
        })
        res()
    })
   promise.then(() => {
    socket.emit('work_done')
   }) 
})

const work = async (raw) => {
    const data = JSON.parse(raw);
    // console.log("DATA.EVENT", data.event)
    switch(data.event){
        case "category_clicked":
            const data1 = data.properties.category.name;
            if(data1) await incrementCount("categories", data1);
            break;
        case "company_clicked":
            const data2 = data.properties.company.companyName;
            if(data2) await incrementCount("companies", data2)
            break;
        case "stack_clicked":
            // console.log("DATA", data.properties)
            const data3 = data.properties.stack.companyName;
            if(data3) await incrementCount("stacks", data3)
            break;
        case "nav_clicked":
            const data4 = {doc: data.properties.nav, user: data.properties?.user.fullName ?? data.properties?.user.email ?? "", time: data.sentAt ?? ""};
            if(data4) await writeNotfication(data4)
    }
}

const writeNotfication = async (data) => {
    console.log("WRITING NOTIFICATION ", data)
    const listRef = ref(db, 'notifications');
    const notifRef = push(listRef);
    set(notifRef, {
        user: data.user,
        time: data.time,
        read: false
    });
    // await set(ref(db, `notifications/${data.doc}/`), {
    //     user: data.user,
    //     time: data.time,
    //     read: false
    // })
}

const incrementCount = async (collection, doc) => {
    // console.log("INCREMENTING ", collection, doc)
    doc = doc.replace(".", " ");
  await set(ref(db, `${collection}/${doc}`), {
        count: increment(1)
  });

}