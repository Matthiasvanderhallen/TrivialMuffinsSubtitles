# 1. Requirements
- A working python installation
- Node.js and its package manager npm

# 2. Node.js packages

The following commands install the necessary Node.js packages. To run the communication server, websockets is needed.
For the reconnecting clients (Master, Slave, Prompter), reconnect-core and browserify is needed.

```
npm install websockets
npm install reconnect-core
npm install browserify
```

# 3. Development
You can edit {Master,Slave,Prompter,Server}.js, {Master,Slave,Prompter}.html, Boventiteling.css to develop the subtitler.
When any of the browser-running javascript files is editted (i.e. {Master,Slave,Prompter}.js) run `./Bundle` to update the {Master,Slave,Prompter}-bundle.js files.

# 4. Deploy

- `./MasterServer` runs the necessary python code for serving the master.
- `./Server` runs Server.js in node

