# ReactJS Whatsapp Clone
A side project developed with the objective to learn and experience the popular React framework. This app utilizes web sockets to enable features as listed below. The login system only requires a single string (username), if the username does not exist, a new user will be created automatically. Messages are not encrypted.

# Features
1. Real-time Online/Last seen timestamp  
![image](https://user-images.githubusercontent.com/25372669/162619056-df6eef2d-8697-40c9-b08d-3409c1bf5388.png)
2. Real-time message's read receipts Sent/Received/Read states  
![image](https://user-images.githubusercontent.com/25372669/162619005-52572c7a-1419-4cc0-9bf3-b638ab6c1770.png)
3. Async text sending - No need to wait for message to send out before typing the next message
![image](https://user-images.githubusercontent.com/25372669/162619238-d86a073f-edf0-459e-93b0-ea092da83d66.png)
4. Lazy loading of messages, triggered by scrolling up
5. Real-time group chat and direct messaging

# Tech Stack
- ReactJS v17
- ExpressJS
- MongoDB

# Usage
1. Run `npm install`
2. Create `.env` file in root directory with the following:
```
MONGODB_URL=<connection_string>
REACT_URL=http://localhost:4200
```
3. Run `npm start`.

# Credits
- Socket IO - https://www.npmjs.com/package/socket.io
