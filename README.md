# Whatsapp Clone Web Application
A side project developed with the objective to learn and experience the popular React framework. This app utilizes web sockets to enable features as listed below. The login system only comprises of an 8 digit number, if the number entered does not exist in DB, a new account will be created automatically. Messages are not encrypted. Lastly, MongoDB connection string is omitted in this repository for safety reasons.
![overall](https://user-images.githubusercontent.com/25372669/138921672-51fcd91d-75d6-4246-9dca-5b9064cea9b9.png)

# Features
1. Real-time Online/Last seen timestamp  
![last_seen](https://user-images.githubusercontent.com/25372669/138921726-061664c4-1d3f-4740-bff1-6856f7e67d18.png)
2. Real-time message's read receipts Sent/Received/Read states  
![receipts](https://user-images.githubusercontent.com/25372669/138921717-74313319-3a51-409b-aada-0423bbeb1847.png)
3. Real-time group chat and direct messaging

# Tech Stack
- ReactJS 17
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
