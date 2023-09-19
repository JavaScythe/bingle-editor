const fs = require('fs');
let state = {
    commandPartial: "",
    commandStem: "",
    commandFillIndex: 0,
    commandResponse: "",
    commandResponseTimeout: undefined,
    commandHistory: [],
    commandHistoryIndex: 0,
    testText: [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ",
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ",
        "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. ",
        "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ",
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ",
        "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. ",
        "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. "
    ],
    cursorMode: "single",
    cursorX: 0,
    cursorY: 0,
    targetX: null,
    fileY: 0,
    findText: "",
    findIndex: 0
}

let config;
try{
    config = JSON.parse(fs.readFileSync(process.env.HOME+ "/.config/bingle-editor/config.json", "utf8"));  
}catch(e){
    console.error("failed to parse config\n", e);
    process.exit();
}
function termBug(){
    return {
        x: process.stdout.columns,
        y: process.stdout.rows
    }
}
function spaceGen(x){
    let s = "";
    for(let i = 0; i < x; i++){
        s += " ";
    }
    return s;
}
function paintUi(){
    //make border around entire terminal
    process.stdout.write('\u001b[3J\u001b[1J');
    console.clear();
    process.stdout.write('\x1b[2J');
    process.stdout.write('\x1b[0f');
    process.stdout.write('\x1b[?25l');
    let bug = termBug();
    let x = bug.x;
    let y = bug.y+2;
    let border = '═';
    let topleft = '╔';
    let bottomleft = '╚';
    let topright = '╗';
    let bottomright = '╝';
    let left = '║';
    let right = '║';
    let space = '';
    //space to fill in the ui minus bordewr
    for(let i = 0; i < x - 2; i++){
        space += ' ';
    }
    let lineBreak = '\n';
    //make top border
    let topBorder = topleft;
    for(let i = 0; i < x - 2; i++){
        topBorder += border;
    }
    topBorder += topright;
    //make bottom border
    let bottomBorder = bottomleft;
    for(let i = 0; i < x - 2; i++){
        if(i == 10 && state.commandPartial.length > 0){
            bottomBorder += "["+state.commandPartial+"]";
            i += state.commandPartial.length+1;
        } else if(i == 10 && state.commandResponse.length > 0){
            bottomBorder += "["+state.commandResponse+"]";
            i += state.commandResponse.length+1;
        } else {
            bottomBorder += border;
        }
    }
    bottomBorder += bottomright;
    //make left and right borders
    let leftBorder = '';
    let rightBorder = '';
    for(let i = 0; i < y - 4; i++){
        if(state.testText[i+state.fileY]){
            let line = state.testText[i+state.fileY];
            if(i == state.cursorY- state.fileY && state.cursorMode == "single"){
                //highlight the character by inserting highlight codes around it
                leftBorder += left + line.slice(0, state.cursorX) + '\x1b[30;47m' + line[state.cursorX] + '\x1b[0m' + line.slice(state.cursorX+1) + spaceGen(bug.x-line.length-2) + right;
            } else {
                leftBorder += left + line + spaceGen(bug.x-line.length-2) + right;
            }
        } else {
            leftBorder += left + space + right;
        }
    }
    //write out the ui
    let ui = topBorder + lineBreak + leftBorder + bottomBorder;
    process.stdout.write(ui);
}
const approved = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","0","1","2","3","4","5","6","7","8","9"," ",".","/"];
let commands = [
    ":q",
    ":help",
    ":open",
    ":close",
    ":left",
];
const stdin = process.stdin;
stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding('utf8');
stdin.on('data', key => {
    if(key === ':'){
        state.commandPartial = ":";
        //stop command response timeout
        if(state.commandResponseTimeout) {
            clearTimeout(state.commandResponseTimeout);
        }
        state.commandResponse = "";
        paintUi();
    } else if(key === '\r' && state.commandPartial.length > 0){
        if(state.commandStem.length > 0){
            state.commandStem = "";
            state.commandFillIndex = 0;
        }
        if(state.commandPartial == ":q"){
            process.stdout.write('\u001b[3J\u001b[1J');
            console.clear();
            process.stdout.write('\x1b[2J');
            process.stdout.write('\x1b[0f');
            process.stdout.write('\x1b[?25l');
            process.exit();
        }
        if(state.commandPartial == ":help"){
            state.commandResponse = "bro check manpage or something";
        }
        if(state.commandPartial == ":left"){
            moveCursorByWords('left');
            state.commandResponse = "done";
        }
        if(state.commandPartial == ":right"){
            moveCursorByWords('right');
            state.commandResponse = "done";
        }
        if(state.commandPartial == ":close"){
            state.testText = [];
            state.commandResponse = "closed file";
        }
        if(state.commandPartial.startsWith(":find ") && state.commandPartial.length > 6){
            state.findText = state.commandPartial.split(" ")[1];
            let findIndex = -1;
            let xFindIndex = -1;
            for(let i = 0; i < state.testText.length; i++){
                if(state.testText[i].includes(state.findText)){
                    findIndex = i;
                    xFindIndex = state.testText[i].indexOf(state.findText)+state.findText.length;
                    break;
                }
            }
            if(findIndex == -1){
                state.commandResponse = "not found";
            } else {
                state.cursorY = findIndex;
                state.cursorX = xFindIndex;
                state.findIndex = 1;
                appearHook();
                state.commandResponse = "found";
            }
        }
        if(state.commandPartial == ":find"){
            let lFindIndex = 0;
            for(let i=0; i < state.testText.length; i++){
                if(state.testText[i].includes(state.findText)){
                    if(lFindIndex < state.findIndex){
                        lFindIndex++;
                        continue;
                    } else if(lFindIndex == state.findIndex){    
                        state.cursorY = i;
                        state.cursorX = state.testText[i].indexOf(state.findText)+state.findText.length;
                        state.findIndex++;
                        break;
                    }
                }
            }
            if(lFindIndex == state.findIndex){
                state.commandResponse = "no more";
            } else {
                appearHook();
                state.commandResponse = "found";
            }
        }
        if(state.commandPartial.startsWith(":open ")){
            let filename = state.commandPartial.split(" ")[1];
            let file = fs.readFileSync(__dirname + "/" + filename, "utf8");
            state.testText = file.split("\n");
            for(let i in state.testText){
                state.testText[i] = state.testText[i]+" ";
            }
            state.commandResponse = "opened file";
        }
        state.commandHistory.push(state.commandPartial);
        state.commandPartial = "";
        if(state.commandResponse.length > 0){
            state.commandResponseTimeout = setTimeout(() => {
                state.commandResponse = "";
                paintUi();
            }, 1500);
        }
        state.commandHistoryIndex = state.commandHistory.length;
        paintUi();
        //if key is not backspace
    //autofill commands from partial on tab
    } else if(state.commandPartial.length > 0 && key === '\t'){
        //set command stem to partial
        if(state.commandStem.length == 0){
            state.commandStem = state.commandPartial;
        }
        //fill partial with matching commands
        state.commandPartial = "";
        for(let i = state.commandFillIndex; i < commands.length; i++){
            if(commands[i].startsWith(state.commandStem)){
                state.commandPartial = commands[i];
                state.commandFillIndex = i+1;
                break;
            }
        }
        if(state.commandPartial.length == 0){
            state.commandPartial = state.commandStem;
            state.commandStem = "";
            state.commandFillIndex = 0;
        }
        paintUi();
    } else if(state.commandPartial.length > 0 && (key === '\b' || key === '\u007f') ){
        //eremove last char
        state.commandPartial = state.commandPartial.slice(0, -1);
        paintUi();
    } else if (state.commandPartial.length == 0 && key == '\u001b[A') {
        if (state.cursorY > 0) {
            state.cursorY -= 1;
            if (state.cursorX > state.testText[state.cursorY].length - 1) {
                if (state.targetX == null) state.targetX = state.cursorX;
                state.cursorX = state.testText[state.cursorY].length - 1;
            } else if (state.targetX !== null && state.cursorX < state.targetX) {
                state.cursorX = Math.min(state.targetX, state.testText[state.cursorY].length - 1);
            }
        }
        appearHook();
        paintUi();
    } else if (state.commandPartial.length == 0 && key == '\u001b[B') {
        if (state.cursorY < state.testText.length - 1) {
            state.cursorY += 1;
            if (state.cursorX > state.testText[state.cursorY].length - 1) {
                if (state.targetX == null) state.targetX = state.cursorX;
                state.cursorX = state.testText[state.cursorY].length - 1;
            } else if (state.targetX !== null && state.cursorX < state.targetX) {
                state.cursorX = Math.min(state.targetX, state.testText[state.cursorY].length - 1);
            }
        }
        appearHook();
        paintUi();
    } else if (state.commandPartial.length == 0 && key == '\u001b[D') {
        state.targetX = null;
        if (state.cursorX > 0) {
            state.cursorX -= 1;
        }
        appearHook();
        paintUi();
    } else if (state.commandPartial.length == 0 && key == '\u001b[C') {
        state.targetX = null;
        if (state.cursorX < state.testText[state.cursorY].length - 1) {
            state.cursorX += 1;
        }
        appearHook();
        paintUi();
    } else if (state.commandPartial.length == 0 && key == '\u001b[1;5D') {
        moveCursorByWords('left');
    } else if(state.commandPartial.length == 0 && key == '\u001b[1;5C'){
        moveCursorByWords('right');
    } else if(state.commandPartial.length == 0 && key == '\u001b[1;5A'){
        state.fileY-=1;
        paintUi();
    } else if(state.commandPartial.length == 0 && key == '\u001b[1;5B'){
        state.fileY+=1;
        paintUi();
    } else if(state.commandPartial.length > 0 && approved.indexOf(key) > -1) {
        state.commandPartial += key;
        paintUi();
    } else if(state.commandPartial.length == 0 && approved.indexOf(key) > -1){
        let line = state.testText[state.cursorY];
        state.testText[state.cursorY] = line.slice(0, state.cursorX) + key + line.slice(state.cursorX);
        state.cursorX += 1;
        appearHook();
        paintUi();
    } else if(key === '\r' && state.commandPartial.length == 0){
        //split line at cursor and put second half on next line
        let line = state.testText[state.cursorY];
        state.testText[state.cursorY] = line.slice(0, state.cursorX);
        state.testText.splice(state.cursorY+1, 0, line.slice(state.cursorX));
        state.cursorY += 1;
        state.cursorX = 0;
        appearHook();
        paintUi();
    } else if(key === '\u007f' && state.commandPartial.length == 0){
        if(state.cursorX == 0){
            //merge lines
            if(state.cursorY > 0){
                let line = state.testText[state.cursorY];
                //remove trailing space of previous line
                state.testText[state.cursorY-1] = state.testText[state.cursorY-1].slice(0, -1);
                state.testText.splice(state.cursorY, 1);
                state.cursorY -= 1;
                state.cursorX = state.testText[state.cursorY].length;
                state.testText[state.cursorY] += line;
                
            }
        } else {
            let line = state.testText[state.cursorY];
            state.testText[state.cursorY] = line.slice(0, state.cursorX-1) + line.slice(state.cursorX);
            state.cursorX -= 1;
        }
        appearHook();
        paintUi();
    }
});
function appearHook(){
    if(state.cursorY < state.fileY){
        state.fileY = state.cursorY;
    } else if(state.cursorY > state.fileY + termBug().y - 4){
        state.fileY = state.cursorY - termBug().y + 4;
    }
}
function moveCursorByWords(direction) {
    const currentLine = state.testText[state.cursorY];
    if (direction === 'left') {
        let idx = state.cursorX - 1;
        while (idx >= 0 && currentLine[idx] === ' ') {
            idx--;
        }
        while (idx >= 0 && currentLine[idx] !== ' ') {
            idx--;
        }
        state.cursorX = idx + 1;
    } else if (direction === 'right') {
        let idx = state.cursorX + 1;
        const len = currentLine.length;
        while (idx < len && currentLine[idx] !== ' ') {
            idx++;
        }
        state.cursorX = idx < len ? idx : len - 1;
    }
    paintUi();
}
//title the process
process.stdout.write('\x1b]0;bingle-editor\x07');
if(process.argv[2]){
    let file = fs.readFileSync(process.argv[2], "utf8");
    state.testText = file.split("\n");
    for(let i in state.testText){
        state.testText[i] = state.testText[i]+" ";
    }
    paintUi();
}
paintUi();