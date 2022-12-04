import {mov, xchg, AsmToMachForSingleOpInstr, AsmToMchForAddLikeInstr, getLabelLine, isregister, ismemory, getFlagState, setFlagState, alu, memalu, memalumem, animate_controlunit, draw8086} from './asmtomach.js'


let editor = document.querySelector("#editor");
let run = document.querySelector("#run-button");
let decode = document.querySelector("#decode-button");
let error = document.querySelector("#error")
let lineNo = 0;
let code = "";

// An array of pairs where first item is label name and second item is line no.
let labels = [];

let a = ace.edit(editor, {
	theme: "ace/theme/cobalt",
	mode: "ace/mode/assembly_x86",
});


let c = document.getElementById("myCanvas");
let ctx = c.getContext("2d");
ctx.lineWidth = "3";
ctx.strokeStyle = "#061731";
draw8086();




// Compile Button Click
run.addEventListener('click', () => {
	lineNo = 0;

	const allcode = a.getValue();
	code = allcode.split("\n");
	for (let i = 0; i < code.length; i++) // Getting all labels
	{
		const words = code[i].split(" ");
		const fword = words[0].toLowerCase();
		if (fword[0] != ";" && fword[fword.length - 1] === ":") // is not comment and is label
		{
			labels.push([fword.substr(0, fword.length - 1).toLowerCase(), i]);
		}
	}
	console.log(code);
	console.log(labels);

})

// Decode Button Click
decode.addEventListener('click', () => {
	if (lineNo < code.length) 
	{
		let fword = code[lineNo].split(" ")[0].toLowerCase();
		while (fword[0] === ";" || getLabelLine(labels, fword.substr(0, fword.length - 1)) != -1) { // Skipping comments and labels
			lineNo++;
			fword = code[lineNo].split(" ")[0].toLowerCase();
		}
		if (lineNo < code.length)
		{
			AsmToMch(code[lineNo]);
			lineNo++;
		}
	}
})

function errorMessage(msg) {
	error.textContent = msg
	error.style.color = "red"

}


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
	
	document.getElementById("CurrInst").innerText = code;
	
	if (instruction === "mov") {
		let machCode = mov(code, words);
		updateMachineCode(machCode);
		return;
	}
	
	else if (instruction === "xchg") {
		let machCode = xchg(code, words);
		updateMachineCode(machCode);
		return;
	}
	
	else if (instruction === "inc") {
		const operand = words[1].toLowerCase();
		const opcode = "1111111";
		const fixedRegBits = "000";
		function increment(val) { return val + 1; }
		
		let machcode = AsmToMachForSingleOpInstr(operand, opcode, fixedRegBits, increment, increment);
		
		if(isregister(operand)) alu(code, machcode, operand + " += 1 ");
		else if (ismemory(operand)) memalumem(code, machcode,operand + " -> ALU", "value += 1", "ALU -> " + operand );
		return ;
	}

	else if (instruction === "dec") {
		const operand = words[1].toLowerCase();
		const opcode = "1111111";
		const fixedRegBits = "001";
		function decrement(val) { return val - 1; }
		
		let machcode = AsmToMachForSingleOpInstr(operand, opcode, fixedRegBits, decrement, decrement);
		
		if(isregister(operand)) alu(code, machcode, operand + " -= 1 ");
		else if (ismemory(operand)) memalumem(code, machcode,operand + " -> ALU", "value -= 1", "ALU -> " + operand );
		return ;
	}

	else if (instruction === "neg") {
		const operand = words[1].toLowerCase();
		const opcode = "1111111";
		const fixedRegBits = "011";
		function negationByte(val) { return 256 - val; }
		function negationWord(val) { return 65536 - val; }
		
		let machcode = AsmToMachForSingleOpInstr(operand, opcode, fixedRegBits, negationWord, negationByte);
		
		if(isregister(operand)) alu(code, machcode, operand + " 2s comlpement");
		else if (ismemory(operand)) memalumem(code, machcode,operand + " -> ALU", operand + " 2s comlpement", "ALU -> " + operand );
		return ;
	}

	else if (instruction === "not") {
		const operand = words[1].toLowerCase();
		const opcode = "1111111";
		const fixedRegBits = "010";
		function negationByte(val) { return 255 - val; }
		function negationWord(val) { return 65535 - val; }
		
		let machcode = AsmToMachForSingleOpInstr(operand, opcode, fixedRegBits, negationWord, negationByte);
		
		if(isregister(operand)) alu(code, machcode, operand +" 1s complement");
		else if (ismemory(operand)) memalumem(code, machcode,operand + " -> ALU", operand +" 1s complement", "ALU -> " + operand );
		return;
	}

	else if (instruction === "and") {
		const firstop = words[1].substring(0, words[1].length - 1).toLowerCase();
		const secondop = words[2].toLowerCase();
		let opcode = "00100";
		let fixed = "100"
		function and_er(val1, val2) { return val1 & val2; }
		
		let machcode =  AsmToMchForAddLikeInstr(firstop, secondop, opcode, fixed, and_er);
		
		if(isregister(firstop)){
			if(ismemory(secondop)) memalu(code, machcode, secondop+" -> ALU", firstop + " && " + secondop);
			else alu(code, machcode, firstop + " && " + secondop)
		}
		else if(ismemory(firstop)){
			memalumem(code, machcode, firstop + " -> ALU",firstop + " && " + secondop, "ALU -> "+ firstop )
		}
		return;
	}
	
	else if (instruction === "or") {
		const firstop = words[1].substring(0, words[1].length - 1).toLowerCase();
		const secondop = words[2].toLowerCase();
		let opcode = "00010";
		let fixed = "001"
		function or_er(val1, val2) { return val1 | val2; }
		
		let machcode =  AsmToMchForAddLikeInstr(firstop, secondop, opcode, fixed, or_er);
		
		if(isregister(firstop)){
			if(ismemory(secondop)) memalu(code, machcode, secondop+" -> ALU", firstop + " || " + secondop);
			else alu(code, machcode, firstop + " || " + secondop)
		}
		else if(ismemory(firstop)){
			memalumem(code, machcode, firstop + " -> ALU",firstop + " || " + secondop, "ALU -> "+ firstop)
		}
		
		return;
	}
	
	else if (instruction === "xor") {
		const firstop = words[1].substring(0, words[1].length - 1).toLowerCase();
		const secondop = words[2].toLowerCase();
		let opcode = "01100";
		let fixed = "110"
		function xor_er(val1, val2) { return val1 ^ val2; }
		
		let machcode = AsmToMchForAddLikeInstr(firstop, secondop, opcode, fixed, xor_er);
		
		if(isregister(firstop)){
			if(ismemory(secondop)) memalu(code, machcode, secondop+" -> ALU", firstop + " xor " + secondop);
			else alu(code, machcode, firstop + " xor " + secondop)
		}
		else if(ismemory(firstop)){
			memalumem(code, machcode, firstop + " -> ALU",firstop + " xor " + secondop, "ALU -> "+ firstop )
		}
		
		return ; 
	}
	
	else if (instruction === "add") {
		const firstop = words[1].substring(0, words[1].length - 1).toLowerCase();
		const secondop = words[2].toLowerCase();
		let opcode = "00000";
		let fixed = "000"
		function adder(val1, val2) { return val1 + val2; }
		
		let machcode = AsmToMchForAddLikeInstr(firstop, secondop, opcode, fixed, adder);
		
		if(isregister(firstop)){
			if(ismemory(secondop)) memalu(code, machcode, secondop+" -> ALU", firstop + " + " + secondop);
			else alu(code, machcode, firstop + " + " + secondop)
		}
		else if(ismemory(firstop)){
			memalumem(code, machcode, firstop + " -> ALU",firstop + " + " + secondop, "ALU -> "+ firstop )
		}
		return ; 
	}
	
	else if (instruction === "sub") {
		const firstop = words[1].substring(0, words[1].length - 1).toLowerCase();
		const secondop = words[2].toLowerCase();
		let opcode = "01010";
		let fixed = "101"
		function subtracter(val1, val2) { return val1 - val2; }
		
		let machcode = AsmToMchForAddLikeInstr(firstop, secondop, opcode, fixed, subtracter);
		
		if(isregister(firstop)){
			if(ismemory(secondop)) memalu(code, machcode, secondop+" -> ALU", firstop + " - " + secondop);
			else alu(code, machcode, firstop + " - " + secondop)
		}
		else if(ismemory(firstop)){
			memalumem(code, machcode, firstop + " -> ALU",firstop + " - " + secondop, "ALU -> "+ firstop )
		}
		return ; 
	}
		
	else if (instruction === "cmp") {
		const firstop = words[1].substring(0, words[1].length - 1).toLowerCase();
		const secondop = words[2].toLowerCase();
		let opcode = "01110";
		let fixed = "111"
		let zflag = false;
		function doNothing(val1, val2) { 
			zflag = val1 === val2
			return val1; 
		}
		
		let machcode = AsmToMchForAddLikeInstr(firstop, secondop, opcode, fixed, doNothing); 
		
		if( zflag ) setFlagState("zero_flag", "1");
		else setFlagState("zero_flag", "0");
		
		if(isregister(firstop)){
			if(ismemory(secondop)) memalu(code, machcode, secondop+" -> ALU", "cmp(" + firstop + ", " + secondop + ")");
			else alu(code, machcode, "cmp(" + firstop + ", " + secondop + ")");
		}
		else if(ismemory(firstop)){
			memalumem(code, machcode, firstop + " -> ALU","cmp(" + firstop + ", " + secondop + ")", "ALU -> "+ firstop );
		}
		
		return;
	}
	
	else if (instruction === "jmp") {
		const oprand = words[1].toLowerCase();
		let machCode = "";
		console.log(getLabelLine(oprand))
		let jmpline = getLabelLine(oprand);
		if (jmpline != -1) {
			lineNo = jmpline;

			machCode += "11101010"; // opcode
			machCode += jmpline.toString(2).padStart(16, "0"); // 16-bit disp
			
			animate_controlunit(code, machCode, "IP =" + lineNo);
		}
		else {
			console.log("ERROR: jmp called on unrecognized label");
			machCode += "NAN";
		}
		updateMachineCode(machCode);
		return;
	}
	
	else if (instruction === "je" || instruction === "jz") {
		const oprand = words[1].toLowerCase();	
		const opcode = "01110100"		
		const trigger = getFlagState("zero_flag");

		let machCode = AsmToMachForConditionalJmpInstr(oprand, opcode, trigger);
		
		if (trigger) animate_controlunit(code, machCode, "IP = " + lineNo);
		else animate_controlunit(code, machCode, "no jmp");
		return;
	}
	
	else if (instruction === "jne") {
		const oprand = words[1].toLowerCase();	
		const opcode = "01110101"		
		const trigger = !getFlagState("zero_flag");

		let machCode = AsmToMachForConditionalJmpInstr(oprand, opcode, trigger);
		
		if (trigger) animate_controlunit(code, machCode, "IP = " + lineNo);
		else animate_controlunit(code, machCode, "no jmp");
		return;
	}
	
	else if (instruction === "nop") {
		let machCode = "10000111" //opcode + w
		machCode += "11000000" // mod + reg + r/m
		
		alu(code, machCode, "ax <-> ax");
		updateMachineCode(machCode);
		return;
	}

	else{
		errorMessage("Unrecognized instruction");
	}
}

// Give the all bit of opcode for second param
// Give bool which is true if jump should happen for third param
function AsmToMachForConditionalJmpInstr(oprand, opcode, trigger) {
	let machCode = "";
		
	let jmpline = getLabelLine(oprand);
	if (jmpline != -1) {
		if (trigger) lineNo = jmpline;

		machCode += opcode; // opcode
		machCode += jmpline.toString(2).padStart(8, "0"); // 8-bit disp
	}
	else{
		errorMessage("ERROR: jmp called on unrecognized label");
		return;
	}
	updateMachineCode(machCode);
	return machCode;
}


export {updateMachineCode, ctx, labels, lineNo, errorMessage}

