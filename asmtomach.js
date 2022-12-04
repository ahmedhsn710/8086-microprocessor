import {updateMachineCode, ctx, labels, errorMessage} from './code.js'

let digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];

// A array of pairs where first item is regname and second item is regcode
let regs16 = [["ax", "000"], ["bx", "011"], ["cx", "001"], ["dx", "010"],
["sp", "100"], ["bp", "101"], ["si", "110"], ["di", "111"]];

let regs8 = [["ah", "000"], ["al", "000"], ["bh", "011"], ["bl", "011"],
["ch", "001"], ["cl", "001"], ["dh", "010"], ["dl", "010"]];

const ClockTimePeriod = 1000;

// Generic R/M class
class Register {
	constructor(reg_name) {
		this.reg_name = reg_name;
	}

	setReg(value) {
		let bin = value.toString(2); // convert binary string

		bin = bin.padStart(16, "0"); // append with zeros

		for (let i = 0; i < 16; i++) {
			const tagID = this.reg_name + "_" + i;
			document.getElementById(tagID).innerHTML = bin[bin.length - i - 1];
		}
	}

	setLowerByte(value) {
		let bin = value.toString(2); // convert binary string

		bin = bin.padStart(8, "0"); // append with zeros

		for (let i = 0; i < 8; i++) {
			const tagID = this.reg_name[0] + "X" + "_" + i;
			document.getElementById(tagID).innerHTML = bin[bin.length - i - 1];
		}
	}

	setHigherByte(value) {
		let bin = value.toString(2); // convert binary string

		bin = bin.padStart(8, "0"); // append with zeros

		for (let i = 8; i < 16; i++) {
			const tagID = this.reg_name[0] + "X" + "_" + i;
			document.getElementById(tagID).innerHTML = bin[15 - i];
		}
	}

	getReg() {
		let value = "";
		for (let i = 0; i < 16; i++) {
			const tagID = this.reg_name + "_" + i;
			value += document.getElementById(tagID).innerText;
		}
		return reverseString(value);
	}

	getLowerByte() {
		let value = "";
		for (let i = 0; i < 16; i++) {
			const tagID = this.reg_name[0] + "X" + "_" + i;
			value += document.getElementById(tagID).innerText;
		}
		value = reverseString(value);
		return value.substring(8)
	}

	getHigherByte() {
		let value = "";
		for (let i = 0; i < 16; i++) {
			const tagID = this.reg_name[0] + "X" + "_" + i;
			value += document.getElementById(tagID).innerText;
		}
		value = reverseString(value);
		return value.substring(0, 8)
	}

}

function isregister(val) {
	for (let i = 0; i < regs16.length; i++) {
		if (val === regs16[i][0] || val === regs8[i][0]) {
			return true;
		}
	}

	return false;
}

function is8byteregister(val) {
	for (let i = 0; i < regs16.length; i++) {
		if (val === regs8[i][0]) {
			return true;
		}
	}

	return false;
}

function getRegCode(name) {
	for (let i = 0; i < regs16.length; i++) {
		if (name === regs16[i][0]) {
			return regs16[i][1];
		}
	}
	for (let i = 0; i < regs8.length; i++) {
		if (name === regs8[i][0]) {
			return regs8[i][1];
		}
	}
	console.log("ERROR: getRegCode called on non-reg name");
	return "";
}

function ismemory(val) {
	if (val.charAt(0) == "[" && val.charAt(val.length - 1 == "]")) {
		return true;
	}

	if (val.charAt(0) == "[" && val.charAt(val.length - 1 !== "]")) {
		console.log("Error!");
		return false;
	}
	return false;
}

function getLabelLine(name) {
	for (let i = 0; i < labels.length; i++) {
		if (name === labels[i][0]) {
			return labels[i][1];
		}
	}
	return -1;
}

function isnumber(val) {
	let count = 0;
	let start = 0;
	if(val[0] === '-'){
		start = 1;
		count++;
	}

	for (let i = start; i < val.length; i++) {
		for (let j = 0; j < digits.length; j++) {
			if (val[i] === digits[j]) {
				count++;
			}
		}
	}

	if (val[val.length-1] === 'b' || val[val.length-1] === 'h') {
		count++;
	}

	if (count >= val.length) {
		return true;
	}
	return false;
}

function setnumber(secondop){
	if(secondop.charAt(secondop.length-1) === 'b'){
		secondop = parseInt(secondop.substring(0, secondop.length-1), 2).toString();
	}
	else if(secondop.charAt(secondop.length-1) === 'h'){
		secondop = parseInt(secondop.substring(0, secondop.length-1), 16).toString();
	}
	return secondop;
}

function reverseString(str) {
	if (str === "") // This is the terminal case that will end the recursion
		return "";

	else
		return reverseString(str.substr(1)) + str.charAt(0);
}

function getLittleEndian(binstr) {
	if (binstr.length == 16) {
		return binstr.substr(8) + binstr.substr(0, 8);
	}
	console.log("ERROR: getLittleEndian called on non-word");
	return binstr;
}

function getFlagState(flagTag) {
	return document.getElementById(flagTag).innerHTML === "1";
}

function setFlagState(flagTag, bit) {
	document.getElementById(flagTag).innerHTML = bit;
}






function draw8086(){
	drawBox("BIU", "", 50, 50);
	drawBox("Decoder", "", 250, 50);
	drawBox("ALU", "", 250, 250);
	drawBox("Memory", "", 50, 250);
	drawBox("Control Unit","", 150, 150);

	drawLine(150, 80, 250, 80);
	drawLine(300, 120, 300, 180);
	drawLine(300, 180, 250, 180);
	drawLine(300, 190, 250, 190);
	drawLine(300, 250, 300, 190);
	drawLine(100, 190, 150, 190);
	drawLine(100, 250, 100, 190);
	drawLine(150, 280, 250, 280);
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function drawBox(name, inst, x, y, clr = '#061731'){
	ctx.fillStyle = clr;
	ctx.fillRect(x, y, 100, 70);
	ctx.font = "10px Comic Sans MS";
	ctx.fillStyle = "white";
	ctx.textAlign = "center";
	ctx.fillText(name, x+50, y+20);
	if(inst.length > 16){
		ctx.fillText(inst.substring(0, 16), x+50, y+40);
		ctx.fillText(inst.substring(16), x+50, y+60);
	}
	else{
		ctx.fillText(inst, x+50, y+40);
	}
		
	ctx.stroke();
}

function drawLine(x1, y1, x2, y2){
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
}

function changeColor(name, inst, x, y){
	drawBox(name, inst, x, y, '#198618')
}

async function fetchdecode(inst, machcode){
	await sleep(ClockTimePeriod);
	changeColor("BIU", inst, 50, 50);
	await sleep(ClockTimePeriod);
	drawBox("BIU", "", 50, 50);
	changeColor("Decoder", machcode, 250, 50);
	await sleep(ClockTimePeriod);
	drawBox("Decoder", "", 250, 50);
	
}

async function alu(inst, machcode, process){
	await fetchdecode(inst, machcode)
	changeColor("ALU", process, 250, 250);
	await sleep(ClockTimePeriod);
	drawBox("ALU", "", 250, 250);	
}

async function animatemem(inst, machcode, mem){
	await fetchdecode(inst, machcode);
	changeColor("Memory", mem, 50, 250);
	await sleep(ClockTimePeriod);
	drawBox("Memory", "", 50, 250);	
}

async function memalumem(inst, machcode, mem1, process, mem2){
	await fetchdecode(inst, machcode);
	changeColor("Memory", mem1, 50, 250);
	await sleep(ClockTimePeriod);
	drawBox("Memory", "", 50, 250);	
	changeColor("ALU", process, 250, 250);
	await sleep(ClockTimePeriod);
	drawBox("ALU", "", 250, 250);
	changeColor("Memory", mem2, 50, 250);
	await sleep(ClockTimePeriod);
	drawBox("Memory", "", 50, 250);	
}

async function memalu(inst, machcode, mem, process){
	await fetchdecode(inst, machcode);
	changeColor("Memory", mem, 50, 250);
	await sleep(ClockTimePeriod);
	drawBox("Memory", "", 50, 250);	
	changeColor("ALU", process, 250, 250);
	await sleep(ClockTimePeriod);
	drawBox("ALU", "", 250, 250);
}

async function alumem(inst, machcode, process, mem){
	await fetchdecode(inst, machcode);
	changeColor("ALU", process, 250, 250);
	await sleep(ClockTimePeriod);
	drawBox("ALU", "", 250, 250);
	changeColor("Memory", mem, 50, 250);
	await sleep(ClockTimePeriod);
	drawBox("Memory", "", 50, 250);	
}

async function animate_controlunit(inst, machcode, process){
	await fetchdecode(inst, machcode)
	changeColor("Control Unit", process, 150, 150);
	await sleep(ClockTimePeriod);
	drawBox("Control Unit", "", 150, 150);	
}






function mov(code, words){
	const firstop = words[1].substring(0, words[1].length - 1).toLowerCase();
	let secondop = words[2].toLowerCase();
	let machCode = "";

	// Register to Register 
	if (isregister(firstop) && isregister(secondop)) {
		let reg1 = new Register(firstop.toUpperCase());
		let reg2 = new Register(secondop.toUpperCase());


		if (is8byteregister(firstop) && is8byteregister(secondop)) {

			if (reg1.reg_name[1].toLowerCase() === "l" && reg2.reg_name[1].toLowerCase() === "l") {
				reg1.setLowerByte(reg2.getLowerByte().padStart(8, "0"));
			}
			else if (reg1.reg_name[1].toLowerCase() === "h" && reg2.reg_name[1].toLowerCase() === "h") {
				reg1.setHigherByte(reg2.getHigherByte().padStart(8, "0"));
			}
			else if (reg1.reg_name[1].toLowerCase() === "l" && reg2.reg_name[1].toLowerCase() === "h") {
				reg1.setLowerByte(reg2.getHigherByte().padStart(8, "0"));
			}
			else if (reg1.reg_name[1].toLowerCase() === "h" && reg2.reg_name[1].toLowerCase() === "l") {
				reg1.setHigherByte(reg2.getLowerByte().padStart(8, "0"));
			}
			else {
				console.log("Error!")
			}

		}
		else {
			reg1.setReg(reg2.getReg().padStart(16, "0"));
		}


		machCode += "100010"; //opcode
		machCode += "1"; //dir
		if (is8byteregister(firstop) && is8byteregister(secondop)) {
			machCode += "0";
		}
		else {
			machCode += "1";
		}

		machCode += "11"; //mod
		machCode += getRegCode(firstop); //reg
		machCode += getRegCode(secondop); //r/m

		alu(code, machCode, secondop + " -> " + firstop);
	}

	// Immidate data to register
	else if (isregister(firstop) && isnumber(secondop)) {
		let reg = new Register(firstop.toUpperCase());
		secondop = setnumber(secondop);

		if (is8byteregister(firstop)) {

			if (reg.reg_name[1].toLowerCase() === "l") {
				reg.setLowerByte(parseInt(secondop));
			}
			else if (reg.reg_name[1].toLowerCase() === "h") {
				reg.setHigherByte(parseInt(secondop));
			}
			else {
				console.log("Error!");
			}

		}
		else {
			reg.setReg(parseInt(secondop));
		}

		machCode += "1100011"; //opcode
		if (is8byteregister(firstop)) {
			machCode += "0";
		}
		else {
			machCode += "1";
		}
		machCode += "11"; //mod
		machCode += "000"; //fixed
		machCode += getRegCode(firstop); //r/m
		machCode += getLittleEndian(parseInt(secondop).toString(2).padStart(16, "0")); //data
		
		alu(code, machCode, secondop + " -> " + firstop);
	}

	// Immidate data to memory
	else if (ismemory(firstop) && isnumber(secondop)) {
		const memloc = firstop.substring(1, firstop.length - 1); //remove []
		secondop = setnumber(secondop);
		
		// Direct memory
		if (isnumber(memloc)) {
			let hexmem = parseInt(memloc, 10).toString(16); // converts int num inside brackets to hex
			hexmem = "f" + hexmem;

			let mem = new Register(hexmem.toUpperCase());
			mem.setReg(parseInt(secondop));

			machCode += "1100011"; //opcode
			machCode += "1"; //w-bit 
			machCode += "00"; //mod
			machCode += "000"; //fixed
			machCode += "110"; //r/m
			machCode += getLittleEndian(parseInt(memloc).toString(2).padStart(16, "0")); //address
			machCode += getLittleEndian(parseInt(secondop).toString(2).padStart(16, "0")); //data
			
			animatemem(code, machCode, secondop + " -> " + firstop);
		}

		// memory in register (NEED TO CHECK MACHINE CODE FOR THIS)
		if (isregister(memloc)) {
			let reg1 = new Register(memloc.toUpperCase());
			let hexmem = parseInt(reg1.getReg().padStart(16, "0"), 2).toString(16); //contains hex of reg1 data.
			hexmem = "f" + hexmem;
			let mem = new Register(hexmem.toUpperCase());
			mem.setReg(parseInt(secondop));
			machCode += "1100011"; //opcode

			machCode += "1"; //w-bit (CHANGE THIS CODE WHEN BYTE MOV FUNCTIONALITY ADDED)
			machCode += "00"; //mod
			machCode += "000"; //fixed
			machCode += "111"; //r/m <- NOT SURE ABOUT THIS
			machCode += getLittleEndian(parseInt(secondop).toString(2).padStart(16, "0")); //data

			animatemem(code, machCode, secondop + " -> " + firstop);
		}

	}

	// Memory to register
	else if (isregister(firstop) && ismemory(secondop)) {
		let reg1 = new Register(firstop.toUpperCase());
		const memloc = secondop.substring(1, secondop.length - 1);

		// Direct memory
		if (isnumber(memloc)) {
			let hexmem = parseInt(memloc, 10).toString(16); // converts int num inside brackets to hex
			hexmem = "f" + hexmem;

			let mem = new Register(hexmem.toUpperCase());

			if (is8byteregister(firstop)) {

				if (reg1.reg_name[1].toLowerCase() === "l") {
					reg1.setLowerByte(mem.getLowerByte().padStart(16, "0"));
				}
				else if (reg1.reg_name[1].toLowerCase() === "h") {
					reg1.setHigherByte(mem.getLowerByte().padStart(16, "0"));
				}
				else {
					console.log("Error!")
				}

			}
			else {
				reg1.setReg(mem.getReg().padStart(16, "0"));
			}



			machCode += "100010"; //opcode
			if (is8byteregister(firstop)) {
				machCode += "0";
			}
			else {
				machCode += "1";
			}
			machCode += "00"; //mod

			machCode += getRegCode(firstop); //reg
			machCode += "110"; //r/m
			machCode += getLittleEndian(parseInt(memloc).toString(2).padStart(16, "0")); //address

			animatemem(code, machCode, secondop + " -> " + firstop);
		}

		// Memory location in register (NEED TO CHECK MACHINE CODE FOR THIS)
		if (isregister(memloc)) {
			let reg2 = new Register(memloc.toUpperCase());
			let hexmem = parseInt(reg2.getReg().padStart(16, "0"), 2).toString(16); //contains hex of reg2 data.
			hexmem = "f" + hexmem;

			let mem = new Register(hexmem.toUpperCase());

			if (is8byteregister(firstop)) {

				if (reg1.reg_name[1].toLowerCase() === "l") {
					reg1.setLowerByte(mem.getLowerByte().padStart(16, "0"));
				}
				else if (reg1.reg_name[1].toLowerCase() === "h") {
					reg1.setHigherByte(mem.getLowerByte().padStart(16, "0"));
				}
				else {
					console.log("Error!")
				}

			}
			else {
				reg1.setReg(mem.getReg().padStart(16, "0"));
			}

			machCode += "100010"; //opcode
			machCode += "1"; //dir
			if (is8byteregister(firstop)) {
				machCode += "0";
			}
			else {
				machCode += "1";
			}
			machCode += "00"; //mod
			machCode += getRegCode(firstop); //reg
			machCode += "111"; //r/m <- NOT SURE ABOUT THIS

			animatemem(code, machCode, secondop + " -> " + firstop);
		}
	}

	// register to memory 
	else if (ismemory(firstop) && isregister(secondop)) {
		let reg2 = new Register(secondop.toUpperCase());
		const memloc = firstop.substring(1, firstop.length - 1); //remove []

		// Direct memory 
		if (isnumber(memloc)) {
			let hexmem = parseInt(memloc, 10).toString(16); // converts int num inside brackets to hex
			hexmem = "f" + hexmem;
			let mem = new Register(hexmem.toUpperCase());
			if (is8byteregister(secondop)) {

				if (reg2.reg_name[1].toLowerCase() === "l") {
					mem.setLowerByte(reg2.getLowerByte().padStart(16, "0"));
				}
				else if (reg2.reg_name[1].toLowerCase() === "h") {
					mem.setLowerByte(reg2.getHigherByte().padStart(16, "0"));
				}
				else {
					console.log("Error!")
				}

			}
			else {
				mem.setReg(reg2.getReg().padStart(16, "0"));
			}


			machCode += "100010"; //opcode

			machCode += "0"; //dir
			if (is8byteregister(firstop)) {
				machCode += "0";
			}
			else {
				machCode += "1";
			}
			machCode += "00"; //mod
			machCode += getRegCode(secondop); //reg
			machCode += "110"; //r/m
			machCode += getLittleEndian(parseInt(memloc).toString(2).padStart(16, "0")); //address

			animatemem(code, machCode, secondop + " -> " + firstop);
		}

		// memory in register (NEED TO CHECK MACHINE CODE FOR THIS)
		if (isregister(memloc)) {
			let reg1 = new Register(memloc.toUpperCase());
			let hexmem = parseInt(reg1.getReg().padStart(16, "0"), 2).toString(16); //contains hex of reg1 data.
			hexmem = "f" + hexmem;

			let mem = new Register(hexmem.toUpperCase());

			if (is8byteregister(secondop)) {

				if (reg2.reg_name[1].toLowerCase() === "l") {
					mem.setLowerByte(reg2.getLowerByte().padStart(16, "0"));
				}
				else if (reg2.reg_name[1].toLowerCase() === "h") {
					mem.setLowerByte(reg2.getHigherByte().padStart(16, "0"));
				}
				else {
					console.log("Error!")
				}

			}
			else {
				mem.setReg(reg2.getReg().padStart(16, "0"));
			}

			machCode += "100010"; //opcode
			machCode += "1"; //dir
			if (is8byteregister(firstop)) {
				machCode += "0";
			}
			else {
				machCode += "1";
			}
			machCode += "00"; //mod
			machCode += getRegCode(secondop); //reg
			machCode += "111"; //r/m <- NOT SURE ABOUT THIS

			animatemem(code, machCode, secondop + " -> " + firstop);
		}
	}

	else{
		errorMessage("Invalid mode");
	}
	return machCode;
}

function xchg(code, words){
	const firstop = words[1].substring(0, words[1].length - 1).toLowerCase();
	const secondop = words[2].toLowerCase();
	let machCode = "";
	if (isregister(firstop)) // First operand is a register
	{
		let reg1 = new Register(firstop.toUpperCase());
		let val1;
		let val2;
		
		if (is8byteregister(firstop))
		{
			if(firstop[1] == "l") val1 = parseInt(reg1.getLowerByte(), 2);
			else val1 = parseInt(reg1.getHigherByte(), 2);
		}
		else 
			val1 = parseInt(reg1.getReg(), 2);

		if (isregister(secondop))// Second operand is also a register.
		{			
			let reg2 = new Register(secondop.toUpperCase());
			if (is8byteregister(secondop))
			{
				if(secondop[1] == "l") 
				{
					val2 = parseInt(reg2.getLowerByte(), 2);
					reg2.setLowerByte(val1);
				}
				else 
				{
					val2 = parseInt(reg2.getHigherByte(), 2);
					reg2.setHigherByte(val1);
				}
			}
			else 
			{
				val2 = parseInt(reg2.getReg(), 2);
				reg2.setReg(val1);
			}
			
			
			machCode += "1000011"; //opcode
			// w-bit added at end
			machCode += "11"; // mod
			machCode += getRegCode(firstop); // reg
			machCode += getRegCode(secondop); // r/m
			
			alu(code, machCode, firstop + "<->" + secondop);
		}
		if (ismemory(secondop))// Second operand is memory.
		{			
			const memloc = secondop.substring(1, secondop.length - 1); //remove []
			let hexmem;
			
			machCode += "1000011"; //opcode
			// w-bit added at end
			machCode += "00"; // mod
			machCode += getRegCode(firstop); // reg
			
			if (isregister(memloc))//case1. Memory is inside reg.
			{
				let reg2 = new Register(memloc.toUpperCase());
				hexmem = parseInt(reg2.getReg().padStart(16, "0"), 2).toString(16); //contains hex of reg1 data.
				
				machCode += "111" // r/m <- NOT USRE ABOUT THIS
			}
			if (isnumber(memloc))//case 2. Memory is given directly.
			{
				hexmem = parseInt(memloc, 10).toString(16); // converts int num inside brackets to hex
				
				machCode += "110" // r/m					
				machCode += getLittleEndian(parseInt(memloc).toString(2).padStart("1", 16)); //address
			}				
			hexmem = "f" + hexmem;
			let mem = new Register(hexmem.toUpperCase());
			val2 = parseInt(mem.getReg(), 2);
			mem.setReg(val1);
			
			memalu(code, machCode, secondop+" -> ALU", firstop + "<->" + secondop);
		}
		
		if (is8byteregister(firstop))
		{
			if(firstop[1] == "l") reg1.setLowerByte(val2);
			else reg1.setHigherByte(val2);
			
			machCode = machCode.substr(0,7) + "0" + machCode.substr(7);
		}
		else 
		{
			reg1.setReg(val2);
			
			machCode = machCode.substr(0,7) + "1" + machCode.substr(7);
		}
	}
	else if (ismemory(firstop))//First operand is memory
	{
		const memloc = firstop.substring(1, firstop.length - 1); //remove []
		let hexmem;
		let val1;
		let reg1;
		let val2;
		let rmCode;
		
		if (isregister(memloc))//case1. memory is inside a register
		{
			reg1 = new Register(memloc.toUpperCase());
			hexmem = parseInt(reg1.getReg().padStart(16, "0"), 2).toString(16); //contains hex of reg1 data.
			rmCode = "111";
		}
		if (isnumber(memloc))//case2. Memory available directly
		{
			hexmem = parseInt(memloc).toString(16); // converts int num inside brackets to hex
			rmCode = "110"
			rmCode += getLittleEndian(parseInt(memloc).toString(2).padStart("1", 16)); //address
		}
		
		hexmem = "f" + hexmem;
		let mem = new Register(hexmem.toUpperCase());
		val1 = parseInt(mem.getReg(), 2);			
		
		if (isregister(secondop))//Second operand is a register.
		{
			machCode += "1000011"; //opcode
			
			let reg2 = new Register(secondop.toUpperCase());
			if (is8byteregister(secondop))
			{
				if(secondop[1] == "l") 
				{
					val2 = parseInt(reg2.getLowerByte(), 2);
					reg2.setLowerByte(val1);
				}
				else 
				{
					val2 = parseInt(reg2.getHigherByte(), 2);
					reg2.setHigherByte(val1);
				}
				
				machCode += "0" // w-bit
			}
			else 
			{
				val2 = parseInt(reg2.getReg(), 2);
				reg2.setReg(val1);
				
				machCode += "1" // w-bit
			}
			
			machCode += "00"; // mod
			machCode += getRegCode(secondop); // reg
			machCode += rmCode; // r/m
		}			
		mem.setReg(val2);
		memalumem(code, machCode, firstop + " -> ALU", firstop + "<->" + secondop, "ALU -> "+ firstop );
	}
	else{
		errorMessage("Invalid mode");
	}
	return machCode;
}

// Give binary string for 2nd to 5th bit of opcode for third param
// Give binary string for the "three fixed reg-bits" (when immediate data is secOp) for fourth param
// Func_w_2params should be the operation performed on the values of both operands, should return int
function AsmToMchForAddLikeInstr(firstop, secondop, opcode, valOfRegWhenImm, func_w_2params) {
	let machCode = "";
	let result;
	if (isregister(firstop)) // First operand is a register. This has three cases.
	{
		let reg1 = new Register(firstop.toUpperCase());
		let val1;
		let val2;
		let sbit = 0;
		let dbit = 0;
		
		if (is8byteregister(firstop))
		{
			if(firstop[1] == "l") val1 = parseInt(reg1.getLowerByte(), 2);
			else val1 = parseInt(reg1.getHigherByte(), 2);
		}
		else 
			val1 = parseInt(reg1.getReg(), 2);
		
		if (isnumber(secondop)) // case1. Second operand is immediete.
		{
			val2 = parseInt(secondop);
			
			machCode += "1" + opcode;
			// s-bit added at end
			// w-bit added at end
			machCode += "11"; // mod
			machCode += valOfRegWhenImm; // fixed
			machCode += getRegCode(firstop); // r/m				
			if (is8byteregister(firstop))
			{
				machCode += parseInt(secondop).toString(2).padStart(8, "0").substr(0,8); //data
			}
			else 
			{
				if( val2 < 256 ) sbit = 1;
				machCode += getLittleEndian(parseInt(secondop).toString(2).padStart(16, "0")); //data
			}
		}

		if (isregister(secondop))// case2. Second operand is also a register.
		{			
			let reg2 = new Register(secondop.toUpperCase());
			if (is8byteregister(secondop))
			{
				if(secondop[1] == "l") val2 = parseInt(reg2.getLowerByte(), 2);
				else val2 = parseInt(reg2.getHigherByte(), 2);
			}
			else val2 = parseInt(reg2.getReg(), 2);
			
			machCode += "0" + opcode;
			// d-bit added at end
			// w-bit added at end
			machCode += "11"; // mod
			machCode += getRegCode(firstop); // reg
			machCode += getRegCode(secondop); // r/m
		}
		if (ismemory(secondop))// case3. Second operand is memory.
		{			
			const memloc = secondop.substring(1, secondop.length - 1); //remove []
			let hexmem;
			
			dbit = 1;
			
			machCode += "0" + opcode;
			// d-bit added at end
			// w-bit added at end
			machCode += "00"; // mod
			machCode += getRegCode(firstop); // reg
			
			if (isregister(memloc))//case1. Memory is inside reg.
			{
				let reg2 = new Register(memloc.toUpperCase());
				hexmem = parseInt(reg2.getReg().padStart(16, "0"), 2).toString(16); //contains hex of reg1 data.
				
				machCode += "111" // r/m <- NOT USRE ABOUT THIS
			}
			if (isnumber(memloc))//case 2. Memory is given directly.
			{
				hexmem = parseInt(memloc, 10).toString(16); // converts int num inside brackets to hex
				
				machCode += "110" // r/m					
				machCode += getLittleEndian(parseInt(memloc).toString(2).padStart("1", 16)); //address
			}				
			hexmem = "f" + hexmem;
			let mem = new Register(hexmem.toUpperCase());
			val2 = parseInt(mem.getReg(), 2);
		}
		
		result = func_w_2params(val1, val2);
		
		
		let sixthbit = (sbit + dbit).toString(); // SUPER MEGA BRAIN CODE TO FIGURE OUT 6TH BIT
		machCode = machCode.substr(0,6) + sixthbit + machCode.substr(6);
		
		if (is8byteregister(firstop))
		{
			if(firstop[1] == "l") reg1.setLowerByte(result);
			else reg1.setHigherByte(result);
			
			machCode = machCode.substr(0,7) + "0" + machCode.substr(7);
		}
		else 
		{
			reg1.setReg(result);
			
			machCode = machCode.substr(0,7) + "1" + machCode.substr(7);
		}
	}
	else if (ismemory(firstop))//First operand is memory. This has two cases.
	{
		const memloc = firstop.substring(1, firstop.length - 1); //remove []
		let hexmem;
		let val1;
		let reg1;
		let val2;
		let rmCode;
		
		if (isregister(memloc))//case1. memory is inside a register
		{
			reg1 = new Register(memloc.toUpperCase());
			hexmem = parseInt(reg1.getReg().padStart(16, "0"), 2).toString(16); //contains hex of reg1 data.
			rmCode = "111";
		}
		if (isnumber(memloc))//case2. Memory available directly
		{
			hexmem = parseInt(memloc).toString(16); // converts int num inside brackets to hex
			rmCode = "110"
			rmCode += getLittleEndian(parseInt(memloc).toString(2).padStart("1", 16)); //address
		}
		
		hexmem = "f" + hexmem;
		let mem = new Register(hexmem.toUpperCase());
		val1 = parseInt(mem.getReg(), 2);			
		
		if (isregister(secondop))//case 1. Second operand is a register.
		{
			machCode += "0" + opcode;
			machCode += "0"; // d-bit
			
			let reg2 = new Register(secondop.toUpperCase());
			if (is8byteregister(secondop))
			{
				if(secondop[1] == "l") val2 = parseInt(reg2.getLowerByte(), 2);
				else val2 = parseInt(reg2.getHigherByte(), 2);
				
				machCode += "0" // w-bit
			}
			else 
			{
				val2 = parseInt(reg2.getReg(), 2);
				
				machCode += "1" // w-bit
			}
			
			machCode += "00"; // mod
			machCode += getRegCode(secondop); // reg
			machCode += rmCode; // r/m
		}
		if (isnumber(secondop))//case2. Second operand is a number.
		{
			val2 = parseInt(secondop);
			
			machCode += "1" + opcode;
			machCode += ( val2 <= 255 ? "1" : "0" ); // s-bit 
			machCode += "1"; // w-bit				
			machCode += "00"; // mod
			machCode += valOfRegWhenImm; // fixed
			machCode += rmCode; // r/m
			machCode += getLittleEndian(parseInt(secondop).toString(2).padStart(16, "0")); //data
		}
		result = func_w_2params(val1, val2);
		
		mem.setReg(result);
	}
	else{
		errorMessage("Invalid mode");
		return;
	}
	updateMachineCode(machCode);
	if (result === 0) setFlagState("zero_flag", "1");
	else setFlagState("zero_flag", "0");
	return machCode;
}

// Give binary string for 1st to 7th bit of opcode for second param
// Give binary string for the "three fixed reg-bits" for third param
// both functions should be the operation performed on the values of the operand, and should return int
function AsmToMachForSingleOpInstr(operand, opcode, fixedValOfRegBits, funcwhen16bit, funcwhen8bit) {
	let machCode = "";
	let val;
	
	if (isregister(operand)) {
		let reg = new Register(operand.toUpperCase());
		
		if(is8byteregister(operand))
		{
			if(reg.reg_name[1] === "H")
			{
				val = parseInt(reg.getHigherByte(), 2);
				val = funcwhen8bit(val);
				reg.setHigherByte(val);
			}
			else if(reg.reg_name[1] === "L")
			{
				val = parseInt(reg.getLowerByte(), 2);
				val = funcwhen8bit(val);
				reg.setLowerByte(val);
			}
			else{
				console.log("error")
			}
		}
		else
		{
			val = parseInt(reg.getReg(), 2);
			val = funcwhen16bit(val);
			reg.setReg(val);
		}
		
		machCode += opcode; //opcode
		if(is8byteregister){
			machCode += "0";
		}
		else
		{
			machCode += "1";
		}
		machCode += "11"; //mod
		machCode += fixedValOfRegBits; //reg
		machCode += getRegCode(operand); //r/m
	}	

	else if (ismemory(operand)) {
		const memloc = operand.substring(1, operand.length - 1); //remove []

		// Direct memory 
		if (isnumber(memloc)) {
			let hexmem = parseInt(memloc, 10).toString(16); // converts int num inside brackets to hex
			hexmem = "f" + hexmem;
			console.log(hexmem);
			let mem = new Register(hexmem.toUpperCase());
			val = parseInt(mem.getReg(), 2);
			val = funcwhen16bit(val);
			mem.setReg(val);


			machCode += opcode; //opcode

			machCode += "1"; //w-bit
			machCode += "00"; //mod
			machCode += fixedValOfRegBits; //fixed
			machCode += "110"; //r/m
			machCode += getLittleEndian(parseInt(memloc).toString(2).padStart(16, "0")); //address			
		}

		// memory in register (NEED TO CHECK MACHINE CODE FOR THIS)
		if (isregister(memloc)) {
			let reg1 = new Register(memloc.toUpperCase());
			let hexmem = parseInt(reg1.getReg().padStart(16, "0"), 2).toString(16); //contains hex of reg1 data.
			hexmem = "f" + hexmem;
			let mem = new Register(hexmem.toUpperCase());
			val = parseInt(mem.getReg(), 2);
			val = funcwhen16bit(val);
			mem.setReg(val);


			machCode += opcode; //opcode
			machCode += "1"; //w-bit
			machCode += "00"; //mod
			machCode += fixedValOfRegBits; //fixed
			machCode += "111"; //r/m  <- NOT SURE ABOUT THIS
		}
	}
	
	else{
		errorMessage("Invalid mode");
		return;
	}
	if(val === 0) setFlagState("zero_flag", 1);
	else setFlagState("zero_flag", 0)
	
	updateMachineCode(machCode);
	return machCode;
}


export {mov, xchg, AsmToMachForSingleOpInstr, AsmToMchForAddLikeInstr, getLabelLine, isregister, ismemory, getFlagState, setFlagState, alu, memalu, memalumem, animate_controlunit, draw8086}