let state = {
    commandPartial: "",
    commandStem: "",
    commandFillIndex: 0
}
function termBug(){
    return {
        x: process.stdout.columns,
        y: process.stdout.rows
    }
}
function paintUi(){
    //make border around entire terminal
    process.stdout.write('\u001b[3J\u001b[1J');
    console.clear();
    process.stdout.write('\033[2J');
    process.stdout.write('\033[0f');
    process.stdout.write('\033[?25l');
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
        if(i == Math.round((bug.x)/1.4) && state.commandPartial.length > 0){
            bottomBorder += "["+state.commandPartial+"]";
            i += state.commandPartial.length+1;
        } else {
            bottomBorder += border;
        }
    }
    bottomBorder += bottomright;
    //make left and right borders
    let leftBorder = '';
    let rightBorder = '';
    for(let i = 0; i < y - 4; i++){
        leftBorder += left + space + right + lineBreak;
    }
    //write out the ui
    let ui = topBorder + lineBreak + leftBorder + bottomBorder;
    process.stdout.write(ui);
}

paintUi();
const approved = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","0","1","2","3","4","5","6","7","8","9"," "];
let commands = [
    ":q",
    ":hbobkbokbokb",
    ":he",
    ":open",
    ":close"
];
const stdin = process.stdin;
stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding('utf8');
stdin.on('data', key => {
    if(key === ':'){
        state.commandPartial = ":";
        paintUi();
        //if key is enter
     } else if(key === '\r'){
        if(state.commandStem.length > 0){
            state.commandStem = "";
            state.commandFillIndex = 0;
        }
        if(state.commandPartial == ":q"){
            process.stdout.write('\u001b[3J\u001b[1J');
            console.clear();
            process.stdout.write('\033[2J');
            process.stdout.write('\033[0f');
            process.stdout.write('\033[?25l');
            process.exit();
        }
        state.commandPartial = "";
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
    } else if(state.commandPartial.length > 0 && approved.indexOf(key) > -1) {
        state.commandPartial += key;
        paintUi();
    }
});