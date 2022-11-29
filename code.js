let editor = document.querySelector("#editor");
let run = document.querySelector("#run-button");
let decode = document.querySelector("#decode-button");
let lineNo = 0;

let digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];

// A array of pairs where first item is regname and second item is regcode
let regs16 = [["ax", "000"], ["bx", "011"], ["cx", "001"], ["dx", "010"],
["sp", "100"], ["bp", "101"], ["si", "110"], ["di", "111"]];


// An array of pairs where first item is label name and second item is line no.
let labels = [];


let regs8 = [["ah", "000"], ["al", "000"], ["bh", "011"], ["bl", "011"],
["ch", "001"], ["cl", "001"], ["dh", "010"], ["dl", "010"]];

let a = ace.edit(editor, {
	theme: "ace/theme/cobalt",
	mode: "ace/mode/assembly_x86",
});


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


// Compile Button Click
run.addEventListener('click', () => {
	lineNo = 0;

    const allcode = a.getValue();
    code = allcode.split("\n");
	for(let i = 0; i < code.length; i++) // Getting all labels
	{		
		const words = code[i].split(" ");
		const fword = words[0].toLowerCase();
		if( fword[0,2] != "//" && fword[fword.length - 1] == ":" ) // is not comment and is label
		{
			labels.push([fword.substr(0, fword.length - 1).toLowerCase(), i]);
		}
	}
	console.log(code);
	console.log(labels);

})


// Decode Button Click
decode.addEventListener('click', () => {
	if(lineNo <= code.length)
	{

		AsmToMch(code[lineNo]);
		console.log(code[lineNo]);
		document.getElementById("CurrInst").innerText = code[lineNo];
		lineNo++;

	}   
})


// Utility Functions
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

function ismemory(val) //checking input if its from memory;
{
	if (val.charAt(0) == "[" && val.charAt(val.length - 1 == "]")) {
		return true;
	}

	if (val.charAt(0) == "[" && val.charAt(val.length - 1 !== "]")) {
		console.log("Error!");
		return false;
	}
	return false;
}

function getLabelLine(name)
{
	for(let i = 0; i < labels.length; i++)
	{
		if(name === labels[i][0])
		{
			return labels[i][1];
		}
	}
	return -1;
}

function isnumber(val)
{
  let count =0;
  for(let i=0; i<val.length; i++)
  {
    for(let j=0; j<digits.length; j++)
	{
		if(val[i] === digits[j])
		{
			count++;
		}
	}

	if (count === val.length) {
		return true;
	}
	return false;
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

function isbinary(str, i = 0) {
	if (i == str.length) {
		return true;
	}
	if (str[i] == 0 || str[i] == 1) {
		let ret = isbinary(str, ++i);
		return ret;
	}
	return false;
}

function ishex(str) {
	var regex = /[0-9A-Fa-f]{6}/g;
	if (str.match(regex)) {
		return true;
	} else {
		return false;
	}

}

// Updates Machine code
function updateMachineCode(binstr) {
	for (let i = 8; i < binstr.length; i += 8) // Loop through and add " " after every byte
	{
		binstr = binstr.substr(0, i) + " " + binstr.substr(i);
		i++;
	}
	for (let i = 17; i < binstr.length; i += 17) // Loop through and remove " " after every word then add "\n"
	{
		binstr = binstr.substr(0, i) + "\n" + binstr.substr(i + 1);
		i++;
	}
	document.getElementById("MachCode").innerText = binstr;
}

// Main Conversion Function
function AsmToMch(code) {
	console.log(code);
	const words = code.split(" ");
	const instruction = words[0].toLowerCase();

	if (instruction[0, 2] === "//") {
		console.log("OHH YEAAAA! comment");
		return;
	}

	if (instruction.toLowerCase() === "mov") {
		const firstop = words[1].substring(0, words[1].length - 1).toLowerCase();
		const secondop = words[2].toLowerCase();
		let machCode = "";
		console.log("OHH YEAAAA! mov");

		// Register to Register 
		if (isregister(firstop) && isregister(secondop)) {
			console.log("OHH YEAAAA! direct");
			let reg1 = new Register(firstop.toUpperCase());
			let reg2 = new Register(secondop.toUpperCase());


			if (is8byteregister(firstop) && is8byteregister(secondop)) {

				if (reg1.reg_name[1].toLowerCase() === "l" && reg2.reg_name[1].toLowerCase() === "l") {
					reg1.setLowerByte(reg2.getLowerByte().padStart(8, "0"));
				}
				if (reg1.reg_name[1].toLowerCase() === "h" && reg2.reg_name[1].toLowerCase() === "h") {
					reg1.setHigherByte(reg2.getHigherByte().padStart(8, "0"));
				}
				if (reg1.reg_name[1].toLowerCase() === "l" && reg2.reg_name[1].toLowerCase() === "h") {
					reg1.setLowerByte(reg2.getHigherByte().padStart(8, "0"));
				}
				if (reg1.reg_name[1].toLowerCase() === "h" && reg2.reg_name[1].toLowerCase() === "l") {
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
		}

		// Immidate data to register
		if (isregister(firstop) && isnumber(secondop)) {
			console.log("OHH YEAAAA! immediate");
			let reg = new Register(firstop.toUpperCase());


			if (is8byteregister(firstop)) {

				if (reg.reg_name[1].toLowerCase() === "l") {
					reg.setLowerByte(parseInt(secondop));
				}
				if (reg.reg_name[1].toLowerCase() === "h") {
					reg.setHigherByte(parseInt(secondop));
				}
				else {
					console.log("Error!")
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

		}

		// Immidate data to memory
		if (ismemory(firstop) && isnumber(secondop)) {
			const memloc = firstop.substring(1, firstop.length - 1); //remove []

			// Direct memory
			if (isnumber(memloc)) {
				console.log("OHH YEAAAA! MEM DIRECT");
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

			}

			// memory in register (NEED TO CHECK MACHINE CODE FOR THIS)
			if (isregister(memloc)) {
				console.log("OHH YEAAAA! MEM INDIRECT");
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
			}	

		}

		// Memory to register
		if (isregister(firstop) && ismemory(secondop)) {
			let reg1 = new Register(firstop.toUpperCase());
			const memloc = secondop.substring(1, secondop.length - 1);

			// Direct memory
			if (isnumber(memloc)) {
				console.log("OHH YEAAAA! REG DIRECT");
				let hexmem = parseInt(memloc, 10).toString(16); // converts int num inside brackets to hex
				hexmem = "f" + hexmem;

				let mem = new Register(hexmem.toUpperCase());

				if (is8byteregister(firstop)) {

					if (reg1.reg_name[1].toLowerCase() === "l") {
						reg1.setLowerByte(mem.getLowerByte().padStart(16, "0"));
					}
					if (reg1.reg_name[1].toLowerCase() === "h") {
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
				machCode += getLittleEndian( parseInt(memloc).toString(2).padStart(16, "0") ); //address
			}

			// Memory location in register (NEED TO CHECK MACHINE CODE FOR THIS)
			if (isregister(memloc)) {
				console.log("OHH YEAAAA! REG INDIRECT");
				let reg2 = new Register(memloc.toUpperCase());
				let hexmem = parseInt(reg2.getReg().padStart(16, "0"), 2).toString(16); //contains hex of reg2 data.
				hexmem = "f" + hexmem;

				let mem = new Register(hexmem.toUpperCase());

				if (is8byteregister(firstop)) {

					if (reg1.reg_name[1].toLowerCase() === "l") {
						reg1.setLowerByte(mem.getLowerByte().padStart(16, "0"));
					}
					if (reg1.reg_name[1].toLowerCase() === "h") {
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
			}
		}

		// register to memory 
		if (ismemory(firstop) && isregister(secondop)) {
			let reg2 = new Register(secondop.toUpperCase());
			const memloc = firstop.substring(1, firstop.length - 1); //remove []

			// Direct memory 
			if (isnumber(memloc)) {
				console.log("OHH YEAAAA! REG DIRECT");
				let hexmem = parseInt(memloc, 10).toString(16); // converts int num inside brackets to hex
				hexmem = "f" + hexmem;
				console.log(hexmem);
				let mem = new Register(hexmem.toUpperCase());
				if (is8byteregister(secondop)) {

					if (reg2.reg_name[1].toLowerCase() === "l") {
						mem.setLowerByte(reg2.getLowerByte().padStart(16, "0"));
					}
					if (reg2.reg_name[1].toLowerCase() === "h") {
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
				machCode += getLittleEndian( parseInt(memloc).toString(2).padStart(16, "0") ); //address
			}

			// memory in register (NEED TO CHECK MACHINE CODE FOR THIS)
			if (isregister(memloc)) {
				console.log("OHH YEAAAA! REG INDIRECT");
				let reg1 = new Register(memloc.toUpperCase());
				let hexmem = parseInt(reg1.getReg().padStart(16, "0"), 2).toString(16); //contains hex of reg1 data.
				hexmem = "f" + hexmem;

				let mem = new Register(hexmem.toUpperCase());

				if (is8byteregister(secondop)) {

					if (reg2.reg_name[1].toLowerCase() === "l") {
						mem.setLowerByte(reg2.getLowerByte().padStart(16, "0"));
					}
					if (reg2.reg_name[1].toLowerCase() === "h") {
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
			}			
		}
		
		console.log(machCode);
		updateMachineCode(machCode);
		return;
	}

	if (instruction.toLowerCase() === "inc") {
		const operand = words[1].toLowerCase();

		let machCode = "";
		
		if(isregister(operand))
		{

			let reg = new Register(operand.toUpperCase());
			let val = parseInt(reg.getReg(), 2);
			val++;
			reg.setReg(val);

			
			machCode += "1111111"; //opcode

			machCode += "1"; //w-bit (CHANGE THIS CODE WHEN BYTE MOV FUNCTIONALITY ADDED)
			machCode += "11"; //mod
			machCode += "000"; //fixed
			machCode += getRegCode(operand); //r/mx
		}
		if (ismemory(operand)) {
			const memloc = operand.substring(1, operand.length - 1); //remove []

			// Direct memory 
			if (isnumber(memloc)) {
				let hexmem = parseInt(memloc, 10).toString(16); // converts int num inside brackets to hex
				hexmem = "f" + hexmem;
				console.log(hexmem);
				let mem = new Register(hexmem.toUpperCase());
				let val = parseInt(mem.getReg(), 2);
				val++;
				mem.setReg(val);

				
				machCode += "1111111"; //opcode

				machCode += "1"; //w-bit (CHANGE THIS CODE WHEN BYTE MOV FUNCTIONALITY ADDED)
				machCode += "00"; //mod
				machCode += "000"; //fixed
				machCode += "110"; //r/m

				machCode += getLittleEndian( parseInt(secondop).toString(2).padStart(16, "0") ); //address

			}

			// memory in register (NEED TO CHECK MACHINE CODE FOR THIS)
			if (isregister(memloc)) {
				let reg1 = new Register(memloc.toUpperCase());
				let hexmem = parseInt(reg1.getReg().padStart(16, "0"), 2).toString(16); //contains hex of reg1 data.
				hexmem = "f" + hexmem;
				let mem = new Register(hexmem.toUpperCase());
				let val = parseInt(mem.getReg(), 2);
				val++;
				mem.setReg(val);

				
				machCode += "1111111"; //opcode

				machCode += "1"; //w-bit (CHANGE THIS CODE WHEN BYTE MOV FUNCTIONALITY ADDED)
				machCode += "00"; //mod
				machCode += "000"; //fixed
				machCode += "111"; //r/m  <- NOT SURE ABOUT THIS

			}			

		}
		console.log(machCode);
		updateMachineCode(machCode);
		return;
	}


	if( instruction === "dec")
	{
		const operand = words[1].toLowerCase();
		let machCode = "";
		if(isregister(operand))
		{

			let reg = new Register(operand.toUpperCase());
			let val = parseInt(reg.getReg(), 2);
			val--;
			reg.setReg(val);

			
			machCode += "1111111"; //opcode

			machCode += "1"; //w-bit (CHANGE THIS CODE WHEN BYTE MOV FUNCTIONALITY ADDED)
			machCode += "11"; //mod
			machCode += "001"; //reg
			machCode += getRegCode(operand); //r/m
		}
		if (ismemory(operand)) {
			const memloc = operand.substring(1, operand.length - 1); //remove []

			// Direct memory 
			if (isnumber(memloc)) {
				let hexmem = parseInt(memloc, 10).toString(16); // converts int num inside brackets to hex
				hexmem = "f" + hexmem;
				console.log(hexmem);
				let mem = new Register(hexmem.toUpperCase());
				let val = parseInt(mem.getReg(), 2);
				val--;
				mem.setReg(val);

				
				machCode += "1111111"; //opcode

				machCode += "1"; //w-bit (CHANGE THIS CODE WHEN BYTE MOV FUNCTIONALITY ADDED)
				machCode += "00"; //mod
				machCode += "001"; //fixed
				machCode += "110"; //r/m

				machCode += getLittleEndian( parseInt(secondop).toString(2).padStart(16, "0") ); //address

			}

			// memory in register (NEED TO CHECK MACHINE CODE FOR THIS)
			if (isregister(memloc)) {
				let reg1 = new Register(memloc.toUpperCase());
				let hexmem = parseInt(reg1.getReg().padStart(16, "0"), 2).toString(16); //contains hex of reg1 data.
				hexmem = "f" + hexmem;
				let mem = new Register(hexmem.toUpperCase());
				let val = parseInt(mem.getReg(), 2);
				val--;
				mem.setReg(val);

				
				machCode += "1111111"; //opcode

				machCode += "1"; //w-bit (CHANGE THIS CODE WHEN BYTE MOV FUNCTIONALITY ADDED)
				machCode += "00"; //mod
				machCode += "001"; //fixed
				machCode += "111"; //r/m  <- NOT SURE ABOUT THIS

			}			

		}
		console.log(machCode);
		updateMachineCode(machCode);
		return;
	}


	if( instruction === "neg")
	{
		const operand = words[1];
		let machCode = "";
		
		if(isregister(operand))
		{

			let reg = new Register(operand.toUpperCase());
			let val = parseInt(reg.getReg(), 2);
			val = 65536 - val;
			let str = val.toString(2);
			reg.setReg(str);
			
			machCode += "1111011"; //op-code
			machCode += "1" //w-bit (CHANGE THIS CODE WHEN BYTE MOV FUNCTIONALITY ADDED)
			machCode += "11"; //mod
			machCode += "011"; //fixed
			machCode += getRegCode(operand); //r/m			
		}
		if (ismemory(operand)) {
			const memloc = operand.substring(1, operand.length - 1); //remove []

			// Direct memory 
			if (isnumber(memloc)) {
				let hexmem = parseInt(memloc, 10).toString(16); // converts int num inside brackets to hex
				hexmem = "f" + hexmem;
				console.log(hexmem);
				let mem = new Register(hexmem.toUpperCase());
				let val = parseInt(mem.getReg(), 2);
				val = 65536 - val;
				let str = val.toString(2);
				mem.setReg(str);
				
				machCode += "1111011"; //op-code
				machCode += "1" //w-bit (CHANGE THIS CODE WHEN BYTE MOV FUNCTIONALITY ADDED)
				machCode += "00"; //mod
				machCode += "011"; //fixed
				machCode += "110"; //r/m
				machCode += getLittleEndian( parseInt(memloc).toString(2).padStart(16, "0") ); //address
			}


			// memory in register (NEED TO CHECK MACHINE CODE FOR THIS)
			if(isregister(memloc))
			{

				let reg1 = new Register(memloc.toUpperCase());
				let hexmem = parseInt(reg1.getReg().padStart(16, "0"), 2).toString(16); //contains hex of reg1 data.
				hexmem = "f" + hexmem;
				let mem = new Register(hexmem.toUpperCase());
				let val = parseInt(mem.getReg(), 2);
				val = 65536 - val;
				let str = val.toString(2);
				mem.setReg(str);

				
				machCode += "1111011"; //op-code
				machCode += "1" //w-bit (CHANGE THIS CODE WHEN BYTE MOV FUNCTIONALITY ADDED)
				machCode += "00"; //mod
				machCode += "011"; //fixed
				machCode += "111"; //r/m  <- NOT SURE ABOUT THIS
			}			
		}
		updateMachineCode(machCode);
		return;
	}


	if( instruction === "not")
	{
		const operand = words[1];
		let machCode = "";
		
		if(isregister(operand))
		{

			let reg = new Register(operand.toUpperCase());
			let val = parseInt(reg.getReg(), 2);
			val = 65535 - val;
			let str = val.toString(2);
			reg.setReg(str);
			
			machCode += "1111011"; //op-code
			machCode += "1" //w-bit (CHANGE THIS CODE WHEN BYTE MOV FUNCTIONALITY ADDED)
			machCode += "11"; //mod
			machCode += "010"; //fixed
			machCode += getRegCode(operand); //r/m
		}
		if (ismemory(operand)) {
			const memloc = operand.substring(1, operand.length - 1); //remove []

			// Direct memory 
			if (isnumber(memloc)) {
				let hexmem = parseInt(memloc, 10).toString(16); // converts int num inside brackets to hex
				hexmem = "f" + hexmem;
				console.log(hexmem);
				let mem = new Register(hexmem.toUpperCase());
				let val = parseInt(mem.getReg(), 2);
				val = 65535 - val;
				let str = val.toString(2);
				mem.setReg(str);
				
				machCode += "1111011"; //op-code
				machCode += "1" //w-bit (CHANGE THIS CODE WHEN BYTE MOV FUNCTIONALITY ADDED)
				machCode += "00"; //mod
				machCode += "010"; //fixed
				machCode += "110"; //r/m
				machCode += getLittleEndian( parseInt(memloc).toString(2).padStart(16, "0") ); //address
			}


			// memory in register (NEED TO CHECK MACHINE CODE FOR THIS)
			if(isregister(memloc))
			{

				let reg1 = new Register(memloc.toUpperCase());
				let hexmem = parseInt(reg1.getReg().padStart(16, "0"), 2).toString(16); //contains hex of reg1 data.
				hexmem = "f" + hexmem;
				let mem = new Register(hexmem.toUpperCase());
				let val = parseInt(mem.getReg(), 2);
				val = 65535 - val;
				let str = val.toString(2);
				mem.setReg(str);

				
				machCode += "1111011"; //op-code
				machCode += "1" //w-bit (CHANGE THIS CODE WHEN BYTE MOV FUNCTIONALITY ADDED)
				machCode += "00"; //mod
				machCode += "010"; //fixed
				machCode += "111"; //r/m  <- NOT SURE ABOUT THIS
			}			

		}
		updateMachineCode(machCode);
		return;
	}

	
	if (instruction == "jmp")
	{
		const oprand = words[1].toLowerCase();
		let machCode = "";
		
		let jmpline = getLabelLine(oprand);
		if(jmpline != -1)
		{
			lineNo = jmpline;
			
			machCode += "11101010";
			machCode += jmpline.toString(2).padStart(16, "0");
		}
		else 
		{
			console.log("ERROR: jmp called on unrecognized label");
			MachCode += "NAN";
		}
		updateMachineCode(machCode);
		return;
	}	
}
