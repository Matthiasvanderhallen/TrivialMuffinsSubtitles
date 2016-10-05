# 0. Submodules
The subtitles for each play are located as branches in a submodule. Please do not forget to run 
```
git submodule init
git submodule update
```

# 1. Requirements
- Node.js and its package manager npm

# 2. Node.js packages

The following commands install the necessary Node.js packages. To run the communication server, `websockets` and `hashmap` is needed.
For the reconnecting clients (Master, Slave, Prompter), reconnect-core and browserify is needed (for development only).

```
npm install http-server
npm install websockets
npm install hashmap
npm install reconnect-core
npm install browserify
```

# 3. Development
You can edit {Master,Slave,Prompter,Server}.js, {Master,Slave,Prompter}.html and Boventiteling.css to develop the subtitler.
When any of the browser-running javascript files is editted (i.e. {Master,Slave,Prompter}.js) run `./Bundle` to update the {Master,Slave,Prompter}-bundle.js files.

# 4. Deploy

- `./Server` runs Server.js in node and starts a http-server listening on port 8000. It reads its subtitles from the file `ondertitels.txt` in the main folder.

# 5. Usage
- Go to http://localhost:8000/Master.html on your home screen
- Show http://localhost:8000/Slave.html on your projection screen
- Use the Master.html page to control the projection screen.
